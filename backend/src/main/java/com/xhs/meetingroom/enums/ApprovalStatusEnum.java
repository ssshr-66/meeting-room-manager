package com.xhs.meetingroom.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 审批状态。
 */
@Getter
@AllArgsConstructor
public enum ApprovalStatusEnum {

    PENDING(0, "待审批"),
    APPROVED(1, "通过"),
    REJECTED(2, "驳回");

    private final int code;
    private final String desc;

    public static String descOf(Integer code) {
        if (code == null) return "";
        for (ApprovalStatusEnum e : values()) {
            if (e.code == code) return e.desc;
        }
        return "";
    }
}
