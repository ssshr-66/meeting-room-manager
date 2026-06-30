package com.xhs.meetingroom.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("t_approval")
public class Approval implements Serializable {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long reservationId;
    private Long approverId;

    /** {@link com.xhs.meetingroom.enums.ApprovalStatusEnum} */
    private Integer status;

    private String rejectReason;
    private String remark;
    private LocalDateTime approvedAt;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
