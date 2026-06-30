package com.xhs.meetingroom.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 公告类型。
 */
@Getter
@AllArgsConstructor
public enum NoticeTypeEnum {

    SYSTEM(1, "系统公告"),
    MAINTENANCE(2, "维护通知");

    private final int code;
    private final String desc;

    public static String descOf(Integer code) {
        if (code == null) return "";
        for (NoticeTypeEnum e : values()) {
            if (e.code == code) return e.desc;
        }
        return "";
    }
}
