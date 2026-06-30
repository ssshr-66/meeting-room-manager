package com.xhs.meetingroom.dto.notice;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NoticeUpdateDTO {

    @Size(max = 128)
    private String title;

    @Size(max = 5000)
    private String content;

    private Integer type;

    @Min(0) @Max(2)
    private Integer priority;

    private Integer status;
}
