package com.xhs.meetingroom.vo.user;

import com.xhs.meetingroom.entity.User;
import com.xhs.meetingroom.enums.UserRoleEnum;
import com.xhs.meetingroom.enums.UserStatusEnum;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户响应 VO（不含密码）。
 */
@Data
public class UserVO {

    private Long id;
    private String username;
    private String nickname;
    private String employeeNo;
    private String email;
    private String phone;
    private String avatar;
    private String department;

    private Integer role;
    private String roleDesc;

    private Integer status;
    private String statusDesc;

    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;

    public static UserVO from(User u) {
        if (u == null) return null;
        UserVO vo = new UserVO();
        vo.setId(u.getId());
        vo.setUsername(u.getUsername());
        vo.setNickname(u.getNickname());
        vo.setEmployeeNo(u.getEmployeeNo());
        vo.setEmail(u.getEmail());
        vo.setPhone(u.getPhone());
        vo.setAvatar(u.getAvatar());
        vo.setDepartment(u.getDepartment());
        vo.setRole(u.getRole());
        vo.setRoleDesc(UserRoleEnum.of(u.getRole()).getDesc());
        vo.setStatus(u.getStatus());
        vo.setStatusDesc(u.getStatus() != null && u.getStatus() == UserStatusEnum.NORMAL.getCode() ? "正常" : "禁用");
        vo.setLastLoginAt(u.getLastLoginAt());
        vo.setCreatedAt(u.getCreatedAt());
        return vo;
    }
}
