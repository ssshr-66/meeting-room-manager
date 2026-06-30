package com.xhs.meetingroom.dto.reservation;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReservationCancelDTO {

    @Size(max = 255, message = "取消原因不超过 255 字")
    private String reason;
}
