package com.xhs.meetingroom.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 会议室实体。
 */
@Data
@TableName("t_room")
public class Room implements Serializable {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private String name;
    private String floor;
    private String location;
    private Integer capacity;
    /** 设备列表（逗号分隔） */
    private String equipment;
    private String description;
    private String coverImage;

    /** 是否需要审批 0=否 1=是 */
    private Integer needApproval;

    /** {@link com.xhs.meetingroom.enums.RoomStatusEnum} */
    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;

    @Version
    private Integer version;
}
