package com.xhs.meetingroom.dto.meeting;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SigninDTO {

    @NotNull(message = "预约 ID 不能为空")
    private Long reservationId;

    /** 1=扫码 2=手动；默认手动 */
    private Integer signType = 2;

    /** 扫码时携带的签到 token（一次性，由 /qrcode 返回） */
    private String signToken;
}
