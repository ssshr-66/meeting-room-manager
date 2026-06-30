package com.xhs.meetingroom.controller.system;

import com.xhs.meetingroom.common.result.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 系统健康检查与基础接口。
 */
@RestController
@RequestMapping("/api/v1")
public class PingController {

    /**
     * 健康检查 ping。前端首页用它验证后端连通性。
     */
    @GetMapping("/ping")
    public Result<String> ping() {
        return Result.ok("pong");
    }

    /**
     * 服务基本信息，便于前端展示后端状态。
     */
    @GetMapping("/system/info")
    public Result<Map<String, Object>> info() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("app", "meeting-room-backend");
        data.put("version", "0.0.1-SNAPSHOT");
        data.put("serverTime",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        return Result.ok(data);
    }
}
