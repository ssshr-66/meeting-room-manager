package com.xhs.meetingroom.vo.meeting;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.xhs.meetingroom.entity.Signin;
import com.xhs.meetingroom.enums.SignTypeEnum;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SigninVO {
    private Long id;
    private Long reservationId;
    private Long userId;
    private String userNickname;
    private Integer signType;
    private String signTypeDesc;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime signAt;

    public static SigninVO from(Signin s) {
        if (s == null) return null;
        SigninVO vo = new SigninVO();
        vo.setId(s.getId());
        vo.setReservationId(s.getReservationId());
        vo.setUserId(s.getUserId());
        vo.setSignType(s.getSignType());
        vo.setSignTypeDesc(s.getSignType() != null && s.getSignType() == SignTypeEnum.QR_CODE.getCode()
                ? SignTypeEnum.QR_CODE.getDesc() : SignTypeEnum.MANUAL.getDesc());
        vo.setSignAt(s.getSignAt());
        return vo;
    }
}
