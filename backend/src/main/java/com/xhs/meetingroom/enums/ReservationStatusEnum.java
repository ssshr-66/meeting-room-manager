package com.xhs.meetingroom.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 预约状态。
 *
 * <p>状态流转：
 * <pre>
 *   PENDING_APPROVAL(0)  ──通过──► APPROVED(1) ──时间到──► IN_PROGRESS(2) ──时间结束──► COMPLETED(3)
 *                       └─驳回──► REJECTED(5)
 *                       └─取消──► CANCELLED(4)
 *   APPROVED(1)         └─取消──► CANCELLED(4)
 * </pre>
 */
@Getter
@AllArgsConstructor
public enum ReservationStatusEnum {

    PENDING_APPROVAL(0, "待审批"),
    APPROVED(1, "已通过"),
    IN_PROGRESS(2, "进行中"),
    COMPLETED(3, "已完成"),
    CANCELLED(4, "已取消"),
    REJECTED(5, "已驳回");

    private final int code;
    private final String desc;

    public static String descOf(Integer code) {
        if (code == null) return "";
        for (ReservationStatusEnum e : values()) {
            if (e.code == code) return e.desc;
        }
        return "";
    }

    /** 是否可被用户取消（待审批 / 已通过 / 进行中 都允许） */
    public static boolean canCancel(Integer code) {
        if (code == null) return false;
        return code == PENDING_APPROVAL.code || code == APPROVED.code || code == IN_PROGRESS.code;
    }

    /** 是否可被用户修改（仅 待审批 / 已通过 可改） */
    public static boolean canModify(Integer code) {
        if (code == null) return false;
        return code == PENDING_APPROVAL.code || code == APPROVED.code;
    }

    /** 是否占用资源（用于冲突检测）—— 已通过 / 进行中 视为占用 */
    public static boolean occupiesRoom(Integer code) {
        if (code == null) return false;
        return code == APPROVED.code || code == IN_PROGRESS.code || code == PENDING_APPROVAL.code;
    }
}
