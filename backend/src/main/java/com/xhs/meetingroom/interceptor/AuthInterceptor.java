package com.xhs.meetingroom.interceptor;

import com.xhs.meetingroom.common.constant.SystemConstants;
import com.xhs.meetingroom.common.context.LoginUser;
import com.xhs.meetingroom.common.context.UserContext;
import com.xhs.meetingroom.common.exception.BusinessException;
import com.xhs.meetingroom.common.result.ResultCode;
import com.xhs.meetingroom.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 鉴权拦截器：
 * 1. 解析 Authorization Bearer token，构造 LoginUser 放入 UserContext
 * 2. 如方法/类标注 {@link AdminOnly}，则校验角色
 *
 * <p>白名单路径（登录 / 注册 / 健康检查）在 WebMvcConfig 中通过 excludePathPatterns 排除。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // CORS 预检直接放行
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        if (!(handler instanceof HandlerMethod hm)) {
            return true;
        }

        String header = request.getHeader(SystemConstants.JWT_HEADER);
        if (header == null || !header.startsWith(SystemConstants.JWT_PREFIX)) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }
        String token = header.substring(SystemConstants.JWT_PREFIX.length()).trim();

        Claims claims;
        try {
            claims = jwtUtil.parse(token);
        } catch (Exception e) {
            log.warn("[Auth] token 解析失败: {}", e.getMessage());
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }

        Long userId   = claims.get(JwtUtil.CLAIM_USER_ID, Long.class);
        String name   = claims.get(JwtUtil.CLAIM_USERNAME, String.class);
        Integer role  = claims.get(JwtUtil.CLAIM_ROLE, Integer.class);
        LoginUser user = new LoginUser(userId, name, role);
        UserContext.set(user);

        // 管理员校验
        boolean adminRequired = hm.getMethodAnnotation(AdminOnly.class) != null
                || hm.getBeanType().isAnnotationPresent(AdminOnly.class);
        if (adminRequired && !user.isAdmin()) {
            throw new BusinessException(ResultCode.FORBIDDEN);
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        UserContext.clear();
    }
}
