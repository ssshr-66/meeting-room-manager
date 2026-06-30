package com.xhs.meetingroom.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * JWT 配置（与 application-dev.yml 中 app.jwt.* 对应）。
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    /** HMAC-SHA 密钥（≥ 32 字节） */
    private String secret;

    /** Token 过期时间（分钟） */
    private long expireMinutes = 1440;

    /** 签发人 */
    private String issuer = "meeting-room";
}
