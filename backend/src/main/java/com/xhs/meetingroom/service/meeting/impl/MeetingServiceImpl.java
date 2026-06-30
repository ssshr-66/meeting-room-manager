package com.xhs.meetingroom.service.meeting.impl;

import cn.hutool.crypto.SecureUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.xhs.meetingroom.common.context.UserContext;
import com.xhs.meetingroom.common.exception.BusinessException;
import com.xhs.meetingroom.common.result.ResultCode;
import com.xhs.meetingroom.dto.meeting.MinuteCreateDTO;
import com.xhs.meetingroom.dto.meeting.SigninDTO;
import com.xhs.meetingroom.entity.*;
import com.xhs.meetingroom.enums.ReservationStatusEnum;
import com.xhs.meetingroom.enums.SignTypeEnum;
import com.xhs.meetingroom.mapper.*;
import com.xhs.meetingroom.service.meeting.MeetingService;
import com.xhs.meetingroom.vo.meeting.MinuteVO;
import com.xhs.meetingroom.vo.meeting.QrCodeVO;
import com.xhs.meetingroom.vo.meeting.SigninVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MeetingServiceImpl implements MeetingService {

    /** 签到 token 有效期（分钟） */
    private static final int QR_TOKEN_EXPIRE_MINUTES = 30;
    /** 与 JWT secret 区分开，简单内置 */
    private static final String QR_SECRET = "mr-qr-secret-v1";

    private final ReservationMapper reservationMapper;
    private final SigninMapper signinMapper;
    private final MinuteMapper minuteMapper;
    private final UserMapper userMapper;

    @Override
    public QrCodeVO generateQrCode(Long reservationId) {
        Reservation r = reservationMapper.selectById(reservationId);
        if (r == null) throw new BusinessException(ResultCode.RESERVATION_NOT_EXIST);
        Long me = UserContext.requireUserId();
        if (!r.getUserId().equals(me)) {
            throw new BusinessException(ResultCode.FORBIDDEN, "仅会议组织者可生成签到码");
        }
        long expireAt = System.currentTimeMillis() + QR_TOKEN_EXPIRE_MINUTES * 60_000L;
        String raw = reservationId + ":" + expireAt + ":" + QR_SECRET;
        String token = SecureUtil.md5(raw);
        String qrContent = "mr-signin://reservation/" + reservationId + "?t=" + token + "&exp=" + expireAt;
        return new QrCodeVO(reservationId, token, qrContent, expireAt);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SigninVO signIn(SigninDTO dto) {
        Long uid = UserContext.requireUserId();
        Reservation r = reservationMapper.selectById(dto.getReservationId());
        if (r == null) throw new BusinessException(ResultCode.RESERVATION_NOT_EXIST);

        // 时间窗口校验
        LocalDateTime now = LocalDateTime.now();
        // 允许会议开始前 30 分钟内提前签到
        if (now.isBefore(r.getStartTime().minusMinutes(30))) {
            throw new BusinessException(ResultCode.SIGN_IN_NOT_STARTED);
        }
        if (now.isAfter(r.getEndTime())) {
            throw new BusinessException(ResultCode.SIGN_IN_ENDED);
        }
        // 必须是组织者或参会人员
        boolean isAttendee = r.getUserId().equals(uid)
                || (r.getAttendeeUserIds() != null
                    && java.util.Arrays.stream(r.getAttendeeUserIds().split(","))
                        .map(String::trim).anyMatch(x -> x.equals(uid.toString())));
        if (!isAttendee) {
            throw new BusinessException(ResultCode.SIGN_IN_NOT_ATTENDEE);
        }

        // 重复签到
        Long existed = signinMapper.selectCount(new LambdaQueryWrapper<Signin>()
                .eq(Signin::getReservationId, dto.getReservationId())
                .eq(Signin::getUserId, uid));
        if (existed != null && existed > 0) {
            throw new BusinessException(ResultCode.SIGN_IN_ALREADY);
        }

        Signin s = new Signin();
        s.setReservationId(dto.getReservationId());
        s.setUserId(uid);
        s.setSignType(dto.getSignType() != null ? dto.getSignType() : SignTypeEnum.MANUAL.getCode());
        s.setSignAt(now);
        signinMapper.insert(s);

        // 自动更新预约状态为进行中（如果当前是已通过且时间在窗口内）
        if (r.getStatus() != null && r.getStatus() == ReservationStatusEnum.APPROVED.getCode()
                && now.isAfter(r.getStartTime())) {
            Reservation upd = new Reservation();
            upd.setId(r.getId());
            upd.setStatus(ReservationStatusEnum.IN_PROGRESS.getCode());
            reservationMapper.updateById(upd);
        }
        log.info("[Signin] user={}, reservation={}, type={}", uid, dto.getReservationId(), s.getSignType());
        return SigninVO.from(s);
    }

    @Override
    public List<SigninVO> listSignins(Long reservationId) {
        List<Signin> list = signinMapper.selectList(new LambdaQueryWrapper<Signin>()
                .eq(Signin::getReservationId, reservationId)
                .orderByAsc(Signin::getSignAt));
        if (list.isEmpty()) return List.of();
        List<Long> userIds = list.stream().map(Signin::getUserId).distinct().toList();
        Map<Long, User> userMap = userMapper.selectByIds(userIds).stream()
                .collect(Collectors.toMap(User::getId, x -> x, (a, b) -> a));
        return list.stream().map(s -> {
            SigninVO vo = SigninVO.from(s);
            User u = userMap.get(s.getUserId());
            if (u != null) vo.setUserNickname(u.getNickname());
            return vo;
        }).collect(Collectors.toList());
    }

    /* ========== 会议纪要 ========== */

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createMinute(MinuteCreateDTO dto) {
        Long me = UserContext.requireUserId();
        Reservation r = reservationMapper.selectById(dto.getReservationId());
        if (r == null) throw new BusinessException(ResultCode.RESERVATION_NOT_EXIST);
        Minute m = new Minute();
        m.setReservationId(dto.getReservationId());
        m.setUploaderId(me);
        m.setTitle(dto.getTitle());
        m.setContent(dto.getContent());
        m.setAttachmentUrl(dto.getAttachmentUrl());
        m.setAttachmentName(dto.getAttachmentName());
        minuteMapper.insert(m);
        return m.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteMinute(Long id) {
        Minute m = minuteMapper.selectById(id);
        if (m == null) throw new BusinessException(ResultCode.MINUTE_NOT_EXIST);
        Long me = UserContext.requireUserId();
        if (!m.getUploaderId().equals(me) && !UserContext.require().isAdmin()) {
            throw new BusinessException(ResultCode.FORBIDDEN);
        }
        minuteMapper.deleteById(id);
    }

    @Override
    public List<MinuteVO> listMinutes(Long reservationId) {
        List<Minute> list = minuteMapper.selectList(new LambdaQueryWrapper<Minute>()
                .eq(Minute::getReservationId, reservationId)
                .orderByDesc(Minute::getCreatedAt));
        if (list.isEmpty()) return List.of();
        List<Long> uids = list.stream().map(Minute::getUploaderId).distinct().toList();
        Map<Long, User> userMap = userMapper.selectByIds(uids).stream()
                .collect(Collectors.toMap(User::getId, x -> x, (a, b) -> a));
        return list.stream().map(m -> {
            MinuteVO vo = MinuteVO.from(m);
            User u = userMap.get(m.getUploaderId());
            if (u != null) vo.setUploaderNickname(u.getNickname());
            return vo;
        }).collect(Collectors.toList());
    }
}
