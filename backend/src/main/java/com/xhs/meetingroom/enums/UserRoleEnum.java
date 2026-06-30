package com.xhs.meetingroom.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 用户角色。
 */
@Getter
@AllArgsConstructor
public enum UserRoleEnum {

    USER(1, "普通员工"),
    ADMIN(2, "管理员");

    private final int code;
    private final String desc;

    public static UserRoleEnum of(Integer code) {
        if (code == null) return USER;
        for (UserRoleEnum e : values()) {
            if (e.code == code) return e;
        }
        return USER;
    }
}
