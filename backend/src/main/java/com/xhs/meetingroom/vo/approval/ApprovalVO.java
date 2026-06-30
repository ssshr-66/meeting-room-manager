package com.xhs.meetingroom.vo.approval;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.xhs.meetingroom.entity.Approval;
import com.xhs.meetingroom.enums.ApprovalStatusEnum;
import com.xhs.meetingroom.vo.reservation.ReservationVO;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ApprovalVO {

    private Long id;
    private Long reservationId;
    private Long approverId;
    private String approverNickname;
    private Integer status;
    private String statusDesc;
    private String rejectReason;
    private String remark;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime approvedAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /** 关联预约信息 */
    private ReservationVO reservation;

    public static ApprovalVO from(Approval a) {
        if (a == null) return null;
        ApprovalVO vo = new ApprovalVO();
        vo.setId(a.getId());
        vo.setReservationId(a.getReservationId());
        vo.setApproverId(a.getApproverId());
        vo.setStatus(a.getStatus());
        vo.setStatusDesc(ApprovalStatusEnum.descOf(a.getStatus()));
        vo.setRejectReason(a.getRejectReason());
        vo.setRemark(a.getRemark());
        vo.setApprovedAt(a.getApprovedAt());
        vo.setCreatedAt(a.getCreatedAt());
        return vo;
    }
}
