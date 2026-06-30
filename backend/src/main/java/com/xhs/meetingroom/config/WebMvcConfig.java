package com.xhs.meetingroom.config;

import com.xhs.meetingroom.interceptor.AuthInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web 配置：注册鉴权拦截器 + 设置白名单。
 *
 * <p>CORS 配置见 {@link CorsConfig}。
 */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        // 鉴权白名单
                        "/api/v1/ping",
                        "/api/v1/system/**",
                        "/api/v1/auth/login",
                        "/api/v1/auth/register",
                        "/api/v1/notices/public/**",
                        "/error"
                );
    }
}
