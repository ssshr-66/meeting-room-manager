package com.xhs.meetingroom.dto.reservation;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReservationCreateDTO {

    @NotNull(message = "会议室不能为空")
    private Long roomId;

    @NotBlank(message = "会议主题不能为空")
    @Size(max = 128, message = "会议主题不超过 128 字")
    private String title;

    @Size(max = 500, message = "会议描述不超过 500 字")
    private String description;

    @NotNull(message = "参会人数不能为空")
    @Min(value = 1, message = "参会人数至少 1 人")
    @Max(value = 500, message = "参会人数不能超过 500")
    private Integer attendeeCount;

    /** 参会人员 ID 列表（可空） */
    private List<Long> attendeeUserIds;

    @NotNull(message = "开始时间不能为空")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;

    @NotNull(message = "结束时间不能为空")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;
}
