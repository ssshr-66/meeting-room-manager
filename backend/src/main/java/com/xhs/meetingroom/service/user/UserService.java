package com.xhs.meetingroom.service.user;

import com.xhs.meetingroom.common.page.PageVO;
import com.xhs.meetingroom.dto.user.*;
import com.xhs.meetingroom.vo.user.LoginVO;
import com.xhs.meetingroom.vo.user.UserVO;

public interface UserService {

    LoginVO login(LoginDTO dto);

    UserVO register(RegisterDTO dto);

    UserVO getCurrent();

    UserVO updateProfile(UpdateProfileDTO dto);

    void changePassword(ChangePasswordDTO dto);

    /* ========== 管理员 ========== */

    PageVO<UserVO> page(UserQueryDTO query);

    void setStatus(Long userId, Integer status);
}
