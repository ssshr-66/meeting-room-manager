package com.xhs.meetingroom.common.result;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 业务码定义。
 *
 * <p>编码分段：
 * <ul>
 *   <li>0       - 成功</li>
 *   <li>1xxx    - 通用 / 系统错误</li>
 *   <li>2xxx    - 用户与认证</li>
 *   <li>3xxx    - 会议室</li>
 *   <li>4xxx    - 预约</li>
 *   <li>5xxx    - 审批</li>
 *   <li>6xxx    - 会议</li>
 *   <li>7xxx    - 公告</li>
 *   <li>8xxx    - 统计</li>
 *   <li>9xxx    - 系统管理</li>
 * </ul>
 */
@Getter
@AllArgsConstructor
public enum ResultCode {

    /* ============ 成功 ============ */
    SUCCESS(0, "OK"),

    /* ============ 1xxx 通用 ============ */
    PARAM_INVALID(1001, "参数错误"),
    UNAUTHORIZED(1002, "未登录或登录已过期"),
    FORBIDDEN(1003, "无权限访问"),
    NOT_FOUND(1004, "资源不存在"),
    SYSTEM_ERROR(1500, "系统繁忙，请稍后再试"),
    ;

    private final int code;
    private final String message;
}
