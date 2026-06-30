package com.xhs.meetingroom.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 会议室状态。
 */
@Getter
@AllArgsConstructor
public enum RoomStatusEnum {

    DISABLED(0, "停用"),
    AVAILABLE(1, "可用"),
    MAINTENANCE(2, "维护中");

    private final int code;
    private final String desc;

    public static String descOf(Integer code) {
        if (code == null) return "";
        for (RoomStatusEnum e : values()) {
            if (e.code == code) return e.desc;
        }
        return "";
    }
}
