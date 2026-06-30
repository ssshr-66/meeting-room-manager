package com.xhs.meetingroom.controller.user;

import com.xhs.meetingroom.common.result.Result;
import com.xhs.meetingroom.dto.user.ChangePasswordDTO;
import com.xhs.meetingroom.dto.user.UpdateProfileDTO;
import com.xhs.meetingroom.service.user.UserService;
import com.xhs.meetingroom.vo.user.UserVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 当前登录用户：个人信息 / 修改密码。
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** 当前登录用户信息 */
    @GetMapping("/me")
    public Result<UserVO> me() {
        return Result.ok(userService.getCurrent());
    }

    /** 更新个人资料 */
    @PutMapping("/me")
    public Result<UserVO> updateMe(@Valid @RequestBody UpdateProfileDTO dto) {
        return Result.ok(userService.updateProfile(dto));
    }

    /** 修改密码 */
    @PutMapping("/me/password")
    public Result<Void> changePassword(@Valid @RequestBody ChangePasswordDTO dto) {
        userService.changePassword(dto);
        return Result.ok();
    }
}
