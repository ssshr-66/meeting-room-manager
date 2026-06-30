package com.xhs.meetingroom.util;

import cn.hutool.crypto.digest.BCrypt;

/**
 * 密码工具：BCrypt。
 */
public final class PasswordUtil {

    private PasswordUtil() {
    }

    /** 加密 */
    public static String encode(String rawPassword) {
        return BCrypt.hashpw(rawPassword, BCrypt.gensalt(10));
    }

    /** 校验 */
    public static boolean matches(String rawPassword, String hashedPassword) {
        if (rawPassword == null || hashedPassword == null) return false;
        try {
            return BCrypt.checkpw(rawPassword, hashedPassword);
        } catch (Exception e) {
            return false;
        }
    }
}
