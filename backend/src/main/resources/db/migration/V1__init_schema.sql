-- ============================================================================
--  智能会议室预约管理系统 - 初始化建表脚本
--  目标库: meeting_room_db (utf8mb4 / utf8mb4_0900_ai_ci)
--  说明  : 通过 docker-compose 时由 initdb.d 自动执行；手动执行请先
--          CREATE DATABASE IF NOT EXISTS meeting_room_db ...
-- ============================================================================

USE `meeting_room_db`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 1. 用户表
-- ============================================================================
DROP TABLE IF EXISTS `t_user`;
CREATE TABLE `t_user` (
    `id`            BIGINT UNSIGNED NOT NULL                COMMENT '主键，雪花 ID',
    `username`      VARCHAR(32)     NOT NULL                COMMENT '用户名（登录名）',
    `password`      VARCHAR(100)    NOT NULL                COMMENT '密码（BCrypt 加密）',
    `nickname`      VARCHAR(32)     NOT NULL                COMMENT '昵称 / 真实姓名',
    `employee_no`   VARCHAR(32)     DEFAULT NULL            COMMENT '工号',
    `email`         VARCHAR(64)     NOT NULL                COMMENT '邮箱（唯一）',
    `phone`         VARCHAR(20)     DEFAULT NULL            COMMENT '手机号',
    `avatar`        VARCHAR(255)    DEFAULT NULL            COMMENT '头像 URL',
    `department`    VARCHAR(64)     DEFAULT NULL            COMMENT '所属部门',
    `role`          TINYINT         NOT NULL DEFAULT 1      COMMENT '角色 1=普通员工 2=管理员',
    `status`        TINYINT         NOT NULL DEFAULT 1      COMMENT '状态 1=正常 0=禁用',
    `last_login_at` DATETIME        DEFAULT NULL            COMMENT '最近登录时间',
    `created_at`    DATETIME        NOT NULL                COMMENT '创建时间',
    `updated_at`    DATETIME        NOT NULL                COMMENT '更新时间',
    `deleted`       TINYINT(1)      NOT NULL DEFAULT 0      COMMENT '逻辑删除',
    `version`       INT             NOT NULL DEFAULT 0      COMMENT '乐观锁',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username`   (`username`),
    UNIQUE KEY `uk_email`      (`email`),
    UNIQUE KEY `uk_employeeno` (`employee_no`),
    KEY `idx_status_role`      (`status`, `role`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户表';


-- ============================================================================
-- 2. 会议室表
-- ============================================================================
DROP TABLE IF EXISTS `t_room`;
CREATE TABLE `t_room` (
    `id`              BIGINT UNSIGNED NOT NULL              COMMENT '主键',
    `name`            VARCHAR(64)     NOT NULL              COMMENT '会议室名称',
    `floor`           VARCHAR(32)     NOT NULL              COMMENT '所在楼层（如 "3F"、"B1"）',
    `location`        VARCHAR(128)    DEFAULT NULL          COMMENT '具体位置描述',
    `capacity`        INT             NOT NULL              COMMENT '容纳人数',
    `equipment`       VARCHAR(255)    DEFAULT NULL          COMMENT '设备列表（逗号分隔：投影仪,视频会议,白板...）',
    `description`     VARCHAR(255)    DEFAULT NULL          COMMENT '描述',
    `cover_image`     VARCHAR(255)    DEFAULT NULL          COMMENT '封面图 URL',
    `need_approval`   TINYINT(1)      NOT NULL DEFAULT 0    COMMENT '是否需要审批 0=否 1=是',
    `status`          TINYINT         NOT NULL DEFAULT 1    COMMENT '状态 1=可用 0=停用 2=维护中',
    `created_at`      DATETIME        NOT NULL              COMMENT '创建时间',
    `updated_at`      DATETIME        NOT NULL              COMMENT '更新时间',
    `deleted`         TINYINT(1)      NOT NULL DEFAULT 0    COMMENT '逻辑删除',
    `version`         INT             NOT NULL DEFAULT 0    COMMENT '乐观锁',
    PRIMARY KEY (`id`),
    KEY `idx_status_capacity` (`status`, `capacity`),
    KEY `idx_floor`           (`floor`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '会议室表';


-- ============================================================================
-- 3. 预约表
-- ============================================================================
DROP TABLE IF EXISTS `t_reservation`;
CREATE TABLE `t_reservation` (
    `id`              BIGINT UNSIGNED NOT NULL              COMMENT '主键',
    `user_id`         BIGINT UNSIGNED NOT NULL              COMMENT '预约人 ID',
    `room_id`         BIGINT UNSIGNED NOT NULL              COMMENT '会议室 ID',
    `title`           VARCHAR(128)    NOT NULL              COMMENT '会议主题',
    `description`     VARCHAR(500)    DEFAULT NULL          COMMENT '会议描述',
    `attendee_count`  INT             NOT NULL              COMMENT '参会人数',
    `attendee_user_ids` VARCHAR(1000) DEFAULT NULL          COMMENT '参会人员 ID（逗号分隔，简化方案）',
    `start_time`      DATETIME        NOT NULL              COMMENT '开始时间',
    `end_time`        DATETIME        NOT NULL              COMMENT '结束时间',
    `status`          TINYINT         NOT NULL              COMMENT '状态 0=待审批 1=已通过 2=进行中 3=已完成 4=已取消 5=已驳回',
    `cancel_reason`   VARCHAR(255)    DEFAULT NULL          COMMENT '取消原因',
    `created_at`      DATETIME        NOT NULL              COMMENT '创建时间',
    `updated_at`      DATETIME        NOT NULL              COMMENT '更新时间',
    `deleted`         TINYINT(1)      NOT NULL DEFAULT 0    COMMENT '逻辑删除',
    `version`         INT             NOT NULL DEFAULT 0    COMMENT '乐观锁',
    PRIMARY KEY (`id`),
    KEY `idx_user_status`  (`user_id`, `status`),
    KEY `idx_room_time`    (`room_id`, `start_time`, `end_time`),
    KEY `idx_status_start` (`status`, `start_time`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '预约表';


-- ============================================================================
-- 4. 审批表
-- ============================================================================
DROP TABLE IF EXISTS `t_approval`;
CREATE TABLE `t_approval` (
    `id`              BIGINT UNSIGNED NOT NULL              COMMENT '主键',
    `reservation_id`  BIGINT UNSIGNED NOT NULL              COMMENT '关联预约 ID',
    `approver_id`     BIGINT UNSIGNED DEFAULT NULL          COMMENT '审批人 ID（通过/驳回后填）',
    `status`          TINYINT         NOT NULL DEFAULT 0    COMMENT '审批状态 0=待审批 1=通过 2=驳回',
    `reject_reason`   VARCHAR(255)    DEFAULT NULL          COMMENT '驳回原因',
    `remark`          VARCHAR(255)    DEFAULT NULL          COMMENT '备注',
    `approved_at`     DATETIME        DEFAULT NULL          COMMENT '审批时间',
    `created_at`      DATETIME        NOT NULL              COMMENT '创建时间',
    `updated_at`      DATETIME        NOT NULL              COMMENT '更新时间',
    `deleted`         TINYINT(1)      NOT NULL DEFAULT 0    COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_reservation` (`reservation_id`),
    KEY `idx_status` (`status`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '预约审批表';


-- ============================================================================
-- 5. 签到表
-- ============================================================================
DROP TABLE IF EXISTS `t_signin`;
CREATE TABLE `t_signin` (
    `id`              BIGINT UNSIGNED NOT NULL              COMMENT '主键',
    `reservation_id`  BIGINT UNSIGNED NOT NULL              COMMENT '关联预约 ID',
    `user_id`         BIGINT UNSIGNED NOT NULL              COMMENT '签到用户 ID',
    `sign_type`       TINYINT         NOT NULL DEFAULT 1    COMMENT '签到方式 1=扫码 2=手动',
    `sign_at`         DATETIME        NOT NULL              COMMENT '签到时间',
    `created_at`      DATETIME        NOT NULL              COMMENT '创建时间',
    `deleted`         TINYINT(1)      NOT NULL DEFAULT 0    COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_res_user`  (`reservation_id`, `user_id`),
    KEY `idx_user`            (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '会议签到表';


-- ============================================================================
-- 6. 会议纪要表
-- ============================================================================
DROP TABLE IF EXISTS `t_minute`;
CREATE TABLE `t_minute` (
    `id`              BIGINT UNSIGNED NOT NULL              COMMENT '主键',
    `reservation_id`  BIGINT UNSIGNED NOT NULL              COMMENT '关联预约 ID',
    `uploader_id`     BIGINT UNSIGNED NOT NULL              COMMENT '上传人 ID',
    `title`           VARCHAR(128)    NOT NULL              COMMENT '纪要标题',
    `content`         TEXT            DEFAULT NULL          COMMENT '纪要正文 / 摘要',
    `attachment_url`  VARCHAR(500)    DEFAULT NULL          COMMENT '附件 URL（PDF/图片）',
    `attachment_name` VARCHAR(128)    DEFAULT NULL          COMMENT '附件原始文件名',
    `created_at`      DATETIME        NOT NULL              COMMENT '创建时间',
    `updated_at`      DATETIME        NOT NULL              COMMENT '更新时间',
    `deleted`         TINYINT(1)      NOT NULL DEFAULT 0    COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_reservation` (`reservation_id`),
    KEY `idx_uploader`    (`uploader_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '会议纪要表';


-- ============================================================================
-- 7. 公告表
-- ============================================================================
DROP TABLE IF EXISTS `t_notice`;
CREATE TABLE `t_notice` (
    `id`              BIGINT UNSIGNED NOT NULL              COMMENT '主键',
    `title`           VARCHAR(128)    NOT NULL              COMMENT '公告标题',
    `content`         TEXT            NOT NULL              COMMENT '公告正文',
    `type`            TINYINT         NOT NULL DEFAULT 1    COMMENT '类型 1=系统公告 2=维护通知',
    `priority`        TINYINT         NOT NULL DEFAULT 0    COMMENT '优先级 0=普通 1=重要 2=紧急',
    `publisher_id`    BIGINT UNSIGNED NOT NULL              COMMENT '发布人 ID',
    `status`          TINYINT         NOT NULL DEFAULT 1    COMMENT '状态 1=已发布 0=已下架',
    `publish_at`      DATETIME        DEFAULT NULL          COMMENT '发布时间',
    `created_at`      DATETIME        NOT NULL              COMMENT '创建时间',
    `updated_at`      DATETIME        NOT NULL              COMMENT '更新时间',
    `deleted`         TINYINT(1)      NOT NULL DEFAULT 0    COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    KEY `idx_status_publish` (`status`, `publish_at`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '系统公告表';


-- ============================================================================
-- 8. 操作日志表（可选，目前不强用）
-- ============================================================================
DROP TABLE IF EXISTS `log_operation`;
CREATE TABLE `log_operation` (
    `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`      BIGINT UNSIGNED DEFAULT NULL          COMMENT '操作人',
    `module`       VARCHAR(32)     NOT NULL              COMMENT '业务模块',
    `action`       VARCHAR(64)     NOT NULL              COMMENT '动作',
    `target_id`    BIGINT UNSIGNED DEFAULT NULL          COMMENT '操作目标 ID',
    `detail`       VARCHAR(500)    DEFAULT NULL          COMMENT '详情',
    `ip`           VARCHAR(64)     DEFAULT NULL,
    `created_at`   DATETIME        NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_user_module` (`user_id`, `module`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '操作日志';


SET FOREIGN_KEY_CHECKS = 1;
