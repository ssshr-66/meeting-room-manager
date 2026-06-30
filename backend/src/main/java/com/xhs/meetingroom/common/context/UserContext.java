package com.xhs.meetingroom.common.context;

import com.xhs.meetingroom.common.exception.BusinessException;
import com.xhs.meetingroom.common.result.ResultCode;

/**
 * 登录用户上下文（ThreadLocal 持有）。
 * 由 AuthInterceptor 在请求前 set / 请求后 clear。
 */
public final class UserContext {

    private static final ThreadLocal<LoginUser> HOLDER = new ThreadLocal<>();

    private UserContext() {
    }

    public static void set(LoginUser user) {
        HOLDER.set(user);
    }

    public static LoginUser get() {
        return HOLDER.get();
    }

    /** 获取当前用户，未登录抛业务异常 */
    public static LoginUser require() {
        LoginUser u = HOLDER.get();
        if (u == null) throw new BusinessException(ResultCode.UNAUTHORIZED);
        return u;
    }

    public static Long requireUserId() {
        return require().getUserId();
    }

    public static void clear() {
        HOLDER.remove();
    }
}
