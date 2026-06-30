package com.xhs.meetingroom.common.context;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 登录用户信息（从 JWT 解析得到，绑定到 ThreadLocal）。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginUser {

    private Long userId;
    private String username;
    /** {@link com.xhs.meetingroom.enums.UserRoleEnum} code */
    private Integer role;

    public boolean isAdmin() {
        return role != null && role == 2;
    }
}
