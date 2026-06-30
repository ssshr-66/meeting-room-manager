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
 *   <li>6xxx    - 会议（签到 / 纪要）</li>
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

    /* ============ 2xxx 用户 ============ */
    USER_NOT_EXIST(2001, "用户不存在"),
    USER_PASSWORD_ERROR(2002, "用户名或密码错误"),
    USER_DISABLED(2003, "账号已被禁用"),
    USER_USERNAME_EXIST(2004, "用户名已被注册"),
    USER_EMAIL_EXIST(2005, "邮箱已被注册"),
    USER_EMPLOYEE_NO_EXIST(2006, "工号已存在"),
    USER_OLD_PASSWORD_ERROR(2007, "原密码不正确"),
    USER_CANNOT_DISABLE_SELF(2008, "不能禁用自己的账号"),

    /* ============ 3xxx 会议室 ============ */
    ROOM_NOT_EXIST(3001, "会议室不存在"),
    ROOM_DISABLED(3002, "会议室当前不可用"),
    ROOM_NAME_EXIST(3003, "会议室名称已存在"),
    ROOM_HAS_ACTIVE_RESERVATION(3004, "会议室存在未完成的预约，不能删除"),

    /* ============ 4xxx 预约 ============ */
    RESERVATION_NOT_EXIST(4001, "预约记录不存在"),
    ROOM_OCCUPIED(4002, "所选时段已被占用"),
    RESERVATION_TIME_INVALID(4003, "预约时间不合法"),
    RESERVATION_CANNOT_CANCEL(4004, "当前状态不可取消"),
    RESERVATION_CANNOT_MODIFY(4005, "当前状态不可修改"),
    RESERVATION_ATTENDEE_EXCEED(4006, "参会人数超过会议室容量"),
    RESERVATION_TIME_TOO_LONG(4007, "单次预约时长不能超过 8 小时"),

    /* ============ 5xxx 审批 ============ */
    APPROVAL_NOT_EXIST(5001, "审批记录不存在"),
    APPROVAL_ALREADY_DONE(5002, "该申请已审批完成"),
    APPROVAL_REJECT_REASON_REQUIRED(5003, "驳回必须填写原因"),

    /* ============ 6xxx 会议（签到 / 纪要） ============ */
    SIGN_IN_ALREADY(6001, "您已签到，请勿重复签到"),
    SIGN_IN_NOT_STARTED(6002, "会议尚未开始，无法签到"),
    SIGN_IN_ENDED(6003, "会议已结束，无法签到"),
    SIGN_IN_NOT_ATTENDEE(6004, "您不在本次会议的参会名单中"),
    MINUTE_NOT_EXIST(6005, "会议纪要不存在"),

    /* ============ 7xxx 公告 ============ */
    NOTICE_NOT_EXIST(7001, "公告不存在"),

    /* ============ 8xxx 统计 ============ */
    STAT_RANGE_INVALID(8001, "统计时间范围不合法"),
    ;

    private final int code;
    private final String message;
}
