package com.xhs.meetingroom.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 用户状态。
 */
@Getter
@AllArgsConstructor
public enum UserStatusEnum {

    DISABLED(0, "禁用"),
    NORMAL(1, "正常");

    private final int code;
    private final String desc;
}
