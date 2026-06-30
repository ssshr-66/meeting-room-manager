package com.xhs.meetingroom.dto.notice;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class NoticeCreateDTO {

    @NotBlank(message = "标题不能为空")
    @Size(max = 128)
    private String title;

    @NotBlank(message = "内容不能为空")
    @Size(max = 5000, message = "内容不超过 5000 字")
    private String content;

    @NotNull
    private Integer type;

    @Min(0) @Max(2)
    private Integer priority = 0;

    /** 默认 1=已发布 */
    private Integer status = 1;
}
