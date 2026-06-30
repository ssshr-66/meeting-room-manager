package com.xhs.meetingroom.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("t_minute")
public class Minute implements Serializable {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long reservationId;
    private Long uploaderId;
    private String title;
    private String content;
    private String attachmentUrl;
    private String attachmentName;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
