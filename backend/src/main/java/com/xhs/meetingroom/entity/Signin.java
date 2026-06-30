package com.xhs.meetingroom.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("t_signin")
public class Signin implements Serializable {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private Long reservationId;
    private Long userId;

    /** {@link com.xhs.meetingroom.enums.SignTypeEnum} */
    private Integer signType;

    private LocalDateTime signAt;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableLogic
    private Integer deleted;
}
