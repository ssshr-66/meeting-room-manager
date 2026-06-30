package com.xhs.meetingroom.interceptor;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 仅管理员可访问的接口标记。
 * 配合 {@link AuthInterceptor} 在请求时校验。
 *
 * <p>使用：在 Controller 类或方法上添加 {@code @AdminOnly}。
 */
@Target({ ElementType.TYPE, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
public @interface AdminOnly {
}
