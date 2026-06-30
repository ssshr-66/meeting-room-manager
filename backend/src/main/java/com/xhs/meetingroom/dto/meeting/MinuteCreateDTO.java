package com.xhs.meetingroom.dto.meeting;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MinuteCreateDTO {

    @NotNull
    private Long reservationId;

    @NotBlank(message = "标题不能为空")
    @Size(max = 128)
    private String title;

    @Size(max = 5000, message = "纪要正文不超过 5000 字")
    private String content;

    private String attachmentUrl;

    private String attachmentName;
}
