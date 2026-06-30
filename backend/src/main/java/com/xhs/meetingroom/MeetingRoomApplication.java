package com.xhs.meetingroom;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 智能会议室预约管理系统 - 启动类
 */
@SpringBootApplication
@MapperScan("com.xhs.meetingroom.mapper")
public class MeetingRoomApplication {

    public static void main(String[] args) {
        SpringApplication.run(MeetingRoomApplication.class, args);
    }
}
