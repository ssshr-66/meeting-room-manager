package com.xhs.meetingroom.service.user.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xhs.meetingroom.common.context.UserContext;
import com.xhs.meetingroom.common.exception.BusinessException;
import com.xhs.meetingroom.common.page.PageVO;
import com.xhs.meetingroom.common.result.ResultCode;
import com.xhs.meetingroom.dto.user.*;
import com.xhs.meetingroom.entity.User;
import com.xhs.meetingroom.enums.UserRoleEnum;
import com.xhs.meetingroom.enums.UserStatusEnum;
import com.xhs.meetingroom.mapper.UserMapper;
import com.xhs.meetingroom.service.user.UserService;
import com.xhs.meetingroom.util.JwtUtil;
import com.xhs.meetingroom.util.PasswordUtil;
import com.xhs.meetingroom.vo.user.LoginVO;
import com.xhs.meetingroom.vo.user.UserVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;

    @Override
    public LoginVO login(LoginDTO dto) {
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, dto.getUsername()));
        if (user == null) {
            throw new BusinessException(ResultCode.USER_PASSWORD_ERROR);
        }
        if (!PasswordUtil.matches(dto.getPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.USER_PASSWORD_ERROR);
        }
        if (user.getStatus() != null && user.getStatus() == UserStatusEnum.DISABLED.getCode()) {
            throw new BusinessException(ResultCode.USER_DISABLED);
        }

        // 更新最近登录时间（不影响 updatedAt 业务字段过多，单独更新）
        User update = new User();
        update.setId(user.getId());
        update.setLastLoginAt(LocalDateTime.now());
        userMapper.updateById(update);

        String token = jwtUtil.generate(user.getId(), user.getUsername(), user.getRole());
        log.info("[Login] user {} (id={}) logged in", user.getUsername(), user.getId());
        return new LoginVO(token, UserVO.from(user));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserVO register(RegisterDTO dto) {
        // 唯一性校验
        if (userMapper.selectCount(new LambdaQueryWrapper<User>().eq(User::getUsername, dto.getUsername())) > 0) {
            throw new BusinessException(ResultCode.USER_USERNAME_EXIST);
        }
        if (userMapper.selectCount(new LambdaQueryWrapper<User>().eq(User::getEmail, dto.getEmail())) > 0) {
            throw new BusinessException(ResultCode.USER_EMAIL_EXIST);
        }
        if (dto.getEmployeeNo() != null && !dto.getEmployeeNo().isBlank()
                && userMapper.selectCount(new LambdaQueryWrapper<User>().eq(User::getEmployeeNo, dto.getEmployeeNo())) > 0) {
            throw new BusinessException(ResultCode.USER_EMPLOYEE_NO_EXIST);
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(PasswordUtil.encode(dto.getPassword()));
        user.setNickname(dto.getNickname());
        user.setEmail(dto.getEmail());
        user.setEmployeeNo(dto.getEmployeeNo());
        user.setPhone(dto.getPhone());
        user.setDepartment(dto.getDepartment());
        user.setRole(UserRoleEnum.USER.getCode());
        user.setStatus(UserStatusEnum.NORMAL.getCode());
        userMapper.insert(user);

        log.info("[Register] new user {} (id={})", user.getUsername(), user.getId());
        return UserVO.from(user);
    }

    @Override
    public UserVO getCurrent() {
        Long uid = UserContext.requireUserId();
        User u = userMapper.selectById(uid);
        if (u == null) throw new BusinessException(ResultCode.USER_NOT_EXIST);
        return UserVO.from(u);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserVO updateProfile(UpdateProfileDTO dto) {
        Long uid = UserContext.requireUserId();
        User exist = userMapper.selectById(uid);
        if (exist == null) throw new BusinessException(ResultCode.USER_NOT_EXIST);

        // 邮箱唯一性（若变更）
        if (dto.getEmail() != null && !dto.getEmail().equalsIgnoreCase(exist.getEmail())) {
            if (userMapper.selectCount(new LambdaQueryWrapper<User>()
                    .eq(User::getEmail, dto.getEmail())
                    .ne(User::getId, uid)) > 0) {
                throw new BusinessException(ResultCode.USER_EMAIL_EXIST);
            }
        }

        User u = new User();
        u.setId(uid);
        if (dto.getNickname() != null)   u.setNickname(dto.getNickname());
        if (dto.getEmail() != null)      u.setEmail(dto.getEmail());
        if (dto.getPhone() != null)      u.setPhone(dto.getPhone());
        if (dto.getDepartment() != null) u.setDepartment(dto.getDepartment());
        if (dto.getAvatar() != null)     u.setAvatar(dto.getAvatar());
        userMapper.updateById(u);
        return UserVO.from(userMapper.selectById(uid));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void changePassword(ChangePasswordDTO dto) {
        Long uid = UserContext.requireUserId();
        User exist = userMapper.selectById(uid);
        if (exist == null) throw new BusinessException(ResultCode.USER_NOT_EXIST);
        if (!PasswordUtil.matches(dto.getOldPassword(), exist.getPassword())) {
            throw new BusinessException(ResultCode.USER_OLD_PASSWORD_ERROR);
        }
        User u = new User();
        u.setId(uid);
        u.setPassword(PasswordUtil.encode(dto.getNewPassword()));
        userMapper.updateById(u);
        log.info("[ChangePwd] user {} changed password", uid);
    }

    /* ========== 管理员 ========== */

    @Override
    public PageVO<UserVO> page(UserQueryDTO query) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<User>()
                .eq(query.getRole() != null, User::getRole, query.getRole())
                .eq(query.getStatus() != null, User::getStatus, query.getStatus())
                .and(query.getKeyword() != null && !query.getKeyword().isBlank(), w -> w
                        .like(User::getUsername, query.getKeyword())
                        .or().like(User::getNickname, query.getKeyword())
                        .or().like(User::getEmail, query.getKeyword())
                        .or().like(User::getEmployeeNo, query.getKeyword()))
                .orderByDesc(User::getCreatedAt);
        Page<User> page = new Page<>(query.getPageNum(), query.getPageSize());
        userMapper.selectPage(page, wrapper);
        return PageVO.of(page, UserVO::from);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void setStatus(Long userId, Integer status) {
        if (userId == null || status == null) {
            throw new BusinessException(ResultCode.PARAM_INVALID);
        }
        Long current = UserContext.requireUserId();
        if (userId.equals(current)) {
            throw new BusinessException(ResultCode.USER_CANNOT_DISABLE_SELF);
        }
        if (userMapper.selectById(userId) == null) {
            throw new BusinessException(ResultCode.USER_NOT_EXIST);
        }
        User u = new User();
        u.setId(userId);
        u.setStatus(status);
        userMapper.updateById(u);
    }
}
