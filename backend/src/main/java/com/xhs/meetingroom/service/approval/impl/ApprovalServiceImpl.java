package com.xhs.meetingroom.service.approval.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xhs.meetingroom.common.context.UserContext;
import com.xhs.meetingroom.common.exception.BusinessException;
import com.xhs.meetingroom.common.page.PageVO;
import com.xhs.meetingroom.common.result.ResultCode;
import com.xhs.meetingroom.dto.approval.ApprovalActionDTO;
import com.xhs.meetingroom.dto.approval.ApprovalQueryDTO;
import com.xhs.meetingroom.entity.Approval;
import com.xhs.meetingroom.entity.Reservation;
import com.xhs.meetingroom.entity.Room;
import com.xhs.meetingroom.entity.User;
import com.xhs.meetingroom.enums.ApprovalStatusEnum;
import com.xhs.meetingroom.enums.ReservationStatusEnum;
import com.xhs.meetingroom.mapper.ApprovalMapper;
import com.xhs.meetingroom.mapper.ReservationMapper;
import com.xhs.meetingroom.mapper.RoomMapper;
import com.xhs.meetingroom.mapper.UserMapper;
import com.xhs.meetingroom.service.approval.ApprovalService;
import com.xhs.meetingroom.vo.approval.ApprovalVO;
import com.xhs.meetingroom.vo.reservation.ReservationVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApprovalServiceImpl implements ApprovalService {

    private final ApprovalMapper approvalMapper;
    private final ReservationMapper reservationMapper;
    private final RoomMapper roomMapper;
    private final UserMapper userMapper;

    @Override
    public PageVO<ApprovalVO> page(ApprovalQueryDTO query) {
        LambdaQueryWrapper<Approval> wrapper = new LambdaQueryWrapper<Approval>()
                .eq(query.getStatus() != null, Approval::getStatus, query.getStatus())
                .orderByAsc(Approval::getStatus)      // 待审批优先
                .orderByDesc(Approval::getCreatedAt);
        Page<Approval> page = new Page<>(query.getPageNum(), query.getPageSize());
        approvalMapper.selectPage(page, wrapper);
        List<ApprovalVO> records = enrich(page.getRecords());
        return new PageVO<>(page.getTotal(), page.getCurrent(), page.getSize(), records);
    }

    @Override
    public ApprovalVO getById(Long id) {
        Approval a = approvalMapper.selectById(id);
        if (a == null) throw new BusinessException(ResultCode.APPROVAL_NOT_EXIST);
        return enrich(List.of(a)).get(0);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void action(Long id, ApprovalActionDTO dto) {
        Approval a = approvalMapper.selectById(id);
        if (a == null) throw new BusinessException(ResultCode.APPROVAL_NOT_EXIST);
        if (a.getStatus() != null && a.getStatus() != ApprovalStatusEnum.PENDING.getCode()) {
            throw new BusinessException(ResultCode.APPROVAL_ALREADY_DONE);
        }
        boolean approved = dto.getStatus() != null && dto.getStatus() == ApprovalStatusEnum.APPROVED.getCode();
        boolean rejected = dto.getStatus() != null && dto.getStatus() == ApprovalStatusEnum.REJECTED.getCode();
        if (!approved && !rejected) {
            throw new BusinessException(ResultCode.PARAM_INVALID, "审批结果必须为通过或驳回");
        }
        if (rejected && (dto.getRejectReason() == null || dto.getRejectReason().isBlank())) {
            throw new BusinessException(ResultCode.APPROVAL_REJECT_REASON_REQUIRED);
        }

        Long approverId = UserContext.requireUserId();

        Approval upd = new Approval();
        upd.setId(id);
        upd.setStatus(dto.getStatus());
        upd.setApproverId(approverId);
        upd.setApprovedAt(LocalDateTime.now());
        upd.setRejectReason(rejected ? dto.getRejectReason() : null);
        upd.setRemark(dto.getRemark());
        approvalMapper.updateById(upd);

        // 同步更新预约状态
        Reservation rUpd = new Reservation();
        rUpd.setId(a.getReservationId());
        rUpd.setStatus(approved
                ? ReservationStatusEnum.APPROVED.getCode()
                : ReservationStatusEnum.REJECTED.getCode());
        if (rejected) {
            rUpd.setCancelReason("审批驳回: " + dto.getRejectReason());
        }
        reservationMapper.updateById(rUpd);

        log.info("[Approval] id={} -> {} by approver={}", id, dto.getStatus(), approverId);
    }

    /* ========== private ========== */

    private List<ApprovalVO> enrich(List<Approval> list) {
        if (list == null || list.isEmpty()) return new ArrayList<>();
        List<Long> reservationIds = list.stream().map(Approval::getReservationId).distinct().toList();
        List<Long> approverIds = list.stream()
                .map(Approval::getApproverId).filter(Objects::nonNull).distinct().toList();

        Map<Long, Reservation> resMap = reservationMapper.selectByIds(reservationIds).stream()
                .collect(Collectors.toMap(Reservation::getId, x -> x, (a, b) -> a));
        Set<Long> userIds = new HashSet<>(approverIds);
        resMap.values().forEach(r -> userIds.add(r.getUserId()));
        Map<Long, User> userMap = userIds.isEmpty() ? Map.of()
                : userMapper.selectByIds(userIds).stream()
                    .collect(Collectors.toMap(User::getId, x -> x, (a, b) -> a));

        Set<Long> roomIds = resMap.values().stream().map(Reservation::getRoomId).collect(Collectors.toSet());
        Map<Long, Room> roomMap = roomIds.isEmpty() ? Map.of()
                : roomMapper.selectByIds(roomIds).stream()
                    .collect(Collectors.toMap(Room::getId, x -> x, (a, b) -> a));

        return list.stream().map(a -> {
            ApprovalVO vo = ApprovalVO.from(a);
            if (a.getApproverId() != null) {
                User ap = userMap.get(a.getApproverId());
                if (ap != null) vo.setApproverNickname(ap.getNickname());
            }
            Reservation r = resMap.get(a.getReservationId());
            if (r != null) {
                ReservationVO rv = ReservationVO.from(r);
                User u = userMap.get(r.getUserId());
                if (u != null) {
                    rv.setUserNickname(u.getNickname());
                    rv.setUserEmployeeNo(u.getEmployeeNo());
                }
                Room rm = roomMap.get(r.getRoomId());
                if (rm != null) {
                    rv.setRoomName(rm.getName());
                    rv.setRoomFloor(rm.getFloor());
                }
                vo.setReservation(rv);
            }
            return vo;
        }).collect(Collectors.toList());
    }
}
