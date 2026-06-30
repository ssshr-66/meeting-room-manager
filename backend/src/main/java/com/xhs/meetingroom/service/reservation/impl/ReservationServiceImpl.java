package com.xhs.meetingroom.service.reservation.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xhs.meetingroom.common.context.LoginUser;
import com.xhs.meetingroom.common.context.UserContext;
import com.xhs.meetingroom.common.exception.BusinessException;
import com.xhs.meetingroom.common.page.PageVO;
import com.xhs.meetingroom.common.result.ResultCode;
import com.xhs.meetingroom.dto.reservation.*;
import com.xhs.meetingroom.entity.Approval;
import com.xhs.meetingroom.entity.Reservation;
import com.xhs.meetingroom.entity.Room;
import com.xhs.meetingroom.entity.User;
import com.xhs.meetingroom.enums.ApprovalStatusEnum;
import com.xhs.meetingroom.enums.ReservationStatusEnum;
import com.xhs.meetingroom.enums.RoomStatusEnum;
import com.xhs.meetingroom.mapper.ApprovalMapper;
import com.xhs.meetingroom.mapper.ReservationMapper;
import com.xhs.meetingroom.mapper.RoomMapper;
import com.xhs.meetingroom.mapper.UserMapper;
import com.xhs.meetingroom.service.reservation.ReservationService;
import com.xhs.meetingroom.vo.reservation.ReservationVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    /** 单次预约最大时长（小时） */
    private static final long MAX_DURATION_HOURS = 8;

    private final ReservationMapper reservationMapper;
    private final RoomMapper roomMapper;
    private final ApprovalMapper approvalMapper;
    private final UserMapper userMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create(ReservationCreateDTO dto) {
        LoginUser me = UserContext.require();
        validateTimeRange(dto.getStartTime(), dto.getEndTime());

        Room room = roomMapper.selectById(dto.getRoomId());
        if (room == null) throw new BusinessException(ResultCode.ROOM_NOT_EXIST);
        if (room.getStatus() == null || room.getStatus() != RoomStatusEnum.AVAILABLE.getCode()) {
            throw new BusinessException(ResultCode.ROOM_DISABLED);
        }
        if (dto.getAttendeeCount() > room.getCapacity()) {
            throw new BusinessException(ResultCode.RESERVATION_ATTENDEE_EXCEED,
                    String.format("参会人数 %d 超过会议室容量 %d", dto.getAttendeeCount(), room.getCapacity()));
        }

        // 冲突检测
        List<Reservation> conflicts = reservationMapper.selectConflicts(
                dto.getRoomId(), dto.getStartTime(), dto.getEndTime(), null);
        if (!conflicts.isEmpty()) {
            throw new BusinessException(ResultCode.ROOM_OCCUPIED);
        }

        // 入库
        Reservation r = new Reservation();
        r.setUserId(me.getUserId());
        r.setRoomId(dto.getRoomId());
        r.setTitle(dto.getTitle());
        r.setDescription(dto.getDescription());
        r.setAttendeeCount(dto.getAttendeeCount());
        r.setAttendeeUserIds(joinIds(dto.getAttendeeUserIds()));
        r.setStartTime(dto.getStartTime());
        r.setEndTime(dto.getEndTime());

        boolean needApproval = room.getNeedApproval() != null && room.getNeedApproval() == 1;
        r.setStatus(needApproval
                ? ReservationStatusEnum.PENDING_APPROVAL.getCode()
                : ReservationStatusEnum.APPROVED.getCode());
        reservationMapper.insert(r);

        // 如需审批，生成审批记录
        if (needApproval) {
            Approval a = new Approval();
            a.setReservationId(r.getId());
            a.setStatus(ApprovalStatusEnum.PENDING.getCode());
            approvalMapper.insert(a);
        }

        log.info("[Reservation] create id={}, user={}, room={}, needApproval={}",
                r.getId(), me.getUserId(), room.getId(), needApproval);
        return r.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, ReservationUpdateDTO dto) {
        Reservation r = reservationMapper.selectById(id);
        if (r == null) throw new BusinessException(ResultCode.RESERVATION_NOT_EXIST);
        LoginUser me = UserContext.require();
        if (!r.getUserId().equals(me.getUserId())) {
            throw new BusinessException(ResultCode.FORBIDDEN);
        }
        if (!ReservationStatusEnum.canModify(r.getStatus())) {
            throw new BusinessException(ResultCode.RESERVATION_CANNOT_MODIFY);
        }

        Long targetRoomId = dto.getRoomId() != null ? dto.getRoomId() : r.getRoomId();
        LocalDateTime newStart = dto.getStartTime() != null ? dto.getStartTime() : r.getStartTime();
        LocalDateTime newEnd   = dto.getEndTime()   != null ? dto.getEndTime()   : r.getEndTime();
        validateTimeRange(newStart, newEnd);

        Room room = roomMapper.selectById(targetRoomId);
        if (room == null) throw new BusinessException(ResultCode.ROOM_NOT_EXIST);
        if (room.getStatus() == null || room.getStatus() != RoomStatusEnum.AVAILABLE.getCode()) {
            throw new BusinessException(ResultCode.ROOM_DISABLED);
        }
        Integer cnt = dto.getAttendeeCount() != null ? dto.getAttendeeCount() : r.getAttendeeCount();
        if (cnt > room.getCapacity()) {
            throw new BusinessException(ResultCode.RESERVATION_ATTENDEE_EXCEED);
        }

        // 冲突检测（排除自身）
        List<Reservation> conflicts = reservationMapper.selectConflicts(targetRoomId, newStart, newEnd, id);
        if (!conflicts.isEmpty()) {
            throw new BusinessException(ResultCode.ROOM_OCCUPIED);
        }

        Reservation upd = new Reservation();
        upd.setId(id);
        upd.setRoomId(targetRoomId);
        upd.setStartTime(newStart);
        upd.setEndTime(newEnd);
        upd.setAttendeeCount(cnt);
        if (dto.getTitle() != null)          upd.setTitle(dto.getTitle());
        if (dto.getDescription() != null)    upd.setDescription(dto.getDescription());
        if (dto.getAttendeeUserIds() != null) upd.setAttendeeUserIds(joinIds(dto.getAttendeeUserIds()));

        // 如果原本是 APPROVED，且换了需审批的会议室，应重新走审批；此处简化：保留原状态
        reservationMapper.updateById(upd);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancel(Long id, ReservationCancelDTO dto) {
        Reservation r = reservationMapper.selectById(id);
        if (r == null) throw new BusinessException(ResultCode.RESERVATION_NOT_EXIST);
        LoginUser me = UserContext.require();
        if (!r.getUserId().equals(me.getUserId())) {
            throw new BusinessException(ResultCode.FORBIDDEN);
        }
        if (!ReservationStatusEnum.canCancel(r.getStatus())) {
            throw new BusinessException(ResultCode.RESERVATION_CANNOT_CANCEL);
        }
        Reservation upd = new Reservation();
        upd.setId(id);
        upd.setStatus(ReservationStatusEnum.CANCELLED.getCode());
        upd.setCancelReason(dto != null && dto.getReason() != null ? dto.getReason() : "用户取消");
        reservationMapper.updateById(upd);
    }

    @Override
    public ReservationVO getById(Long id) {
        Reservation r = reservationMapper.selectById(id);
        if (r == null) throw new BusinessException(ResultCode.RESERVATION_NOT_EXIST);
        return enrich(List.of(r), UserContext.requireUserId()).get(0);
    }

    @Override
    public PageVO<ReservationVO> myPage(ReservationQueryDTO query) {
        Long uid = UserContext.requireUserId();
        LambdaQueryWrapper<Reservation> wrapper = buildWrapper(query)
                .eq(Reservation::getUserId, uid)
                .orderByDesc(Reservation::getStartTime);
        Page<Reservation> page = new Page<>(query.getPageNum(), query.getPageSize());
        reservationMapper.selectPage(page, wrapper);
        List<ReservationVO> records = enrich(page.getRecords(), uid);
        return new PageVO<>(page.getTotal(), page.getCurrent(), page.getSize(), records);
    }

    @Override
    public List<ReservationVO> myUpcomingMeetings() {
        Long uid = UserContext.requireUserId();
        LocalDateTime now = LocalDateTime.now();
        // 简化：我创建的 或 attendee_user_ids 包含我的 ID，且未完成、未取消
        List<Reservation> list = reservationMapper.selectList(new LambdaQueryWrapper<Reservation>()
                .and(w -> w
                        .eq(Reservation::getUserId, uid)
                        .or().like(Reservation::getAttendeeUserIds, uid.toString()))
                .ge(Reservation::getEndTime, now)
                .in(Reservation::getStatus,
                        ReservationStatusEnum.APPROVED.getCode(),
                        ReservationStatusEnum.IN_PROGRESS.getCode(),
                        ReservationStatusEnum.PENDING_APPROVAL.getCode())
                .orderByAsc(Reservation::getStartTime));
        return enrich(list, uid);
    }

    @Override
    public PageVO<ReservationVO> adminPage(ReservationQueryDTO query) {
        LambdaQueryWrapper<Reservation> wrapper = buildWrapper(query)
                .eq(query.getUserId() != null, Reservation::getUserId, query.getUserId())
                .orderByDesc(Reservation::getStartTime);
        Page<Reservation> page = new Page<>(query.getPageNum(), query.getPageSize());
        reservationMapper.selectPage(page, wrapper);
        List<ReservationVO> records = enrich(page.getRecords(), UserContext.requireUserId());
        return new PageVO<>(page.getTotal(), page.getCurrent(), page.getSize(), records);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void forceCancel(Long id, String reason) {
        Reservation r = reservationMapper.selectById(id);
        if (r == null) throw new BusinessException(ResultCode.RESERVATION_NOT_EXIST);
        if (!ReservationStatusEnum.canCancel(r.getStatus())) {
            throw new BusinessException(ResultCode.RESERVATION_CANNOT_CANCEL);
        }
        Reservation upd = new Reservation();
        upd.setId(id);
        upd.setStatus(ReservationStatusEnum.CANCELLED.getCode());
        upd.setCancelReason("管理员取消: " + (reason != null ? reason : ""));
        reservationMapper.updateById(upd);
    }

    /* ========== private ========== */

    private void validateTimeRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new BusinessException(ResultCode.RESERVATION_TIME_INVALID, "开始或结束时间不能为空");
        }
        if (!end.isAfter(start)) {
            throw new BusinessException(ResultCode.RESERVATION_TIME_INVALID, "结束时间必须晚于开始时间");
        }
        if (start.isBefore(LocalDateTime.now().minusMinutes(1))) {
            throw new BusinessException(ResultCode.RESERVATION_TIME_INVALID, "开始时间不能早于当前时间");
        }
        long minutes = Duration.between(start, end).toMinutes();
        if (minutes > MAX_DURATION_HOURS * 60) {
            throw new BusinessException(ResultCode.RESERVATION_TIME_TOO_LONG);
        }
    }

    private LambdaQueryWrapper<Reservation> buildWrapper(ReservationQueryDTO q) {
        LambdaQueryWrapper<Reservation> w = new LambdaQueryWrapper<>();
        if (q.getStatus() != null) w.eq(Reservation::getStatus, q.getStatus());
        if (q.getRoomId() != null) w.eq(Reservation::getRoomId, q.getRoomId());
        if (q.getKeyword() != null && !q.getKeyword().isBlank()) {
            w.like(Reservation::getTitle, q.getKeyword());
        }
        if (q.getStartDate() != null) {
            w.ge(Reservation::getStartTime, LocalDateTime.of(q.getStartDate(), LocalTime.MIN));
        }
        if (q.getEndDate() != null) {
            w.le(Reservation::getStartTime, LocalDateTime.of(q.getEndDate(), LocalTime.MAX));
        }
        return w;
    }

    /** 富化：填充 room/user 字段、ownByMe */
    private List<ReservationVO> enrich(List<Reservation> list, Long currentUserId) {
        if (list == null || list.isEmpty()) return new ArrayList<>();
        List<Long> roomIds = list.stream().map(Reservation::getRoomId).distinct().toList();
        List<Long> userIds = list.stream().map(Reservation::getUserId).distinct().toList();
        Map<Long, Room> roomMap = roomMapper.selectByIds(roomIds).stream()
                .collect(Collectors.toMap(Room::getId, x -> x, (a, b) -> a));
        Map<Long, User> userMap = userMapper.selectByIds(userIds).stream()
                .collect(Collectors.toMap(User::getId, x -> x, (a, b) -> a));

        return list.stream().map(r -> {
            ReservationVO vo = ReservationVO.from(r);
            Room rm = roomMap.get(r.getRoomId());
            if (rm != null) {
                vo.setRoomName(rm.getName());
                vo.setRoomFloor(rm.getFloor());
            }
            User u = userMap.get(r.getUserId());
            if (u != null) {
                vo.setUserNickname(u.getNickname());
                vo.setUserEmployeeNo(u.getEmployeeNo());
            }
            vo.setOwnByMe(r.getUserId().equals(currentUserId));
            return vo;
        }).collect(Collectors.toList());
    }

    private String joinIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return null;
        return ids.stream().map(String::valueOf).collect(Collectors.joining(","));
    }
}
