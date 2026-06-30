package com.xhs.meetingroom.controller.user;

import com.xhs.meetingroom.common.result.Result;
import com.xhs.meetingroom.dto.user.LoginDTO;
import com.xhs.meetingroom.dto.user.RegisterDTO;
import com.xhs.meetingroom.service.user.UserService;
import com.xhs.meetingroom.vo.user.LoginVO;
import com.xhs.meetingroom.vo.user.UserVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 认证：登录 / 注册（白名单）。
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO dto) {
        return Result.ok(userService.login(dto));
    }

    @PostMapping("/register")
    public Result<UserVO> register(@Valid @RequestBody RegisterDTO dto) {
        return Result.ok(userService.register(dto));
    }
}
