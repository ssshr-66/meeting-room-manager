package com.xhs.meetingroom.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 签到方式。
 */
@Getter
@AllArgsConstructor
public enum SignTypeEnum {

    QR_CODE(1, "扫码签到"),
    MANUAL(2, "手动签到");

    private final int code;
    private final String desc;
}
