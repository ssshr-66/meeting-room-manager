package com.xhs.meetingroom.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("t_notice")
public class Notice implements Serializable {

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private String title;
    private String content;

    /** {@link com.xhs.meetingroom.enums.NoticeTypeEnum} */
    private Integer type;

    /** 0 普通 1 重要 2 紧急 */
    private Integer priority;

    private Long publisherId;

    /** 1=已发布 0=已下架 */
    private Integer status;

    private LocalDateTime publishAt;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}
