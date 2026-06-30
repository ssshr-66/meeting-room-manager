package com.xhs.meetingroom.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 预约实体。
 */
@Data
@TableName("t_reservation")
public class Reservation implements Serializable {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long userId;
    private Long roomId;
    private String title;
    private String description;
    private Integer attendeeCount;

    /** 参会人员 ID（逗号分隔） */
    private String attendeeUserIds;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    /** {@link com.xhs.meetingroom.enums.ReservationStatusEnum} */
    private Integer status;

    private String cancelReason;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;

    @Version
    private Integer version;
}
