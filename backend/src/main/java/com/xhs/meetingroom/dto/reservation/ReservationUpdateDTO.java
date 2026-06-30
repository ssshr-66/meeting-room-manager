package com.xhs.meetingroom.dto.reservation;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReservationUpdateDTO {

    private Long roomId;

    @Size(max = 128)
    private String title;

    @Size(max = 500)
    private String description;

    @Min(1) @Max(500)
    private Integer attendeeCount;

    private List<Long> attendeeUserIds;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;
}
