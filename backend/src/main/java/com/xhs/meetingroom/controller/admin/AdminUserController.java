package com.xhs.meetingroom.controller.admin;

import com.xhs.meetingroom.common.page.PageVO;
import com.xhs.meetingroom.common.result.Result;
import com.xhs.meetingroom.dto.user.UserQueryDTO;
import com.xhs.meetingroom.interceptor.AdminOnly;
import com.xhs.meetingroom.service.user.UserService;
import com.xhs.meetingroom.vo.user.UserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 管理员 - 用户管理。
 */
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@AdminOnly
public class AdminUserController {

    private final UserService userService;

    /** 用户分页查询 */
    @GetMapping
    public Result<PageVO<UserVO>> page(UserQueryDTO query) {
        return Result.ok(userService.page(query));
    }

    /** 启用 / 禁用账号 */
    @PutMapping("/{id}/status")
    public Result<Void> setStatus(@PathVariable Long id, @RequestParam Integer status) {
        userService.setStatus(id, status);
        return Result.ok();
    }
}
