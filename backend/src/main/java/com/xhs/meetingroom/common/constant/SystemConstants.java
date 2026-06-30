package com.xhs.meetingroom.common.constant;

/**
 * 系统级常量。
 */
public final class SystemConstants {

    private SystemConstants() {
    }

    /** API 路径前缀 */
    public static final String API_PREFIX = "/api/v1";

    /** 默认分页大小 */
    public static final int DEFAULT_PAGE_SIZE = 20;

    /** JWT Header 名 */
    public static final String JWT_HEADER = "Authorization";

    /** JWT Bearer 前缀 */
    public static final String JWT_PREFIX = "Bearer ";
}
