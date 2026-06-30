package com.xhs.meetingroom.util;

import com.xhs.meetingroom.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT 工具类：生成 / 解析 / 校验。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtUtil {

    public static final String CLAIM_USER_ID  = "uid";
    public static final String CLAIM_USERNAME = "uname";
    public static final String CLAIM_ROLE     = "role";

    private final JwtProperties jwtProperties;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 生成 Token。
     */
    public String generate(Long userId, String username, Integer role) {
        long expireMs = jwtProperties.getExpireMinutes() * 60_000L;
        Date now = new Date();
        Date exp = new Date(now.getTime() + expireMs);

        return Jwts.builder()
                .issuer(jwtProperties.getIssuer())
                .subject(String.valueOf(userId))
                .claim(CLAIM_USER_ID, userId)
                .claim(CLAIM_USERNAME, username)
                .claim(CLAIM_ROLE, role)
                .issuedAt(now)
                .expiration(exp)
                .signWith(signingKey())
                .compact();
    }

    /**
     * 解析 Token。失败抛异常，由调用方处理。
     */
    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
