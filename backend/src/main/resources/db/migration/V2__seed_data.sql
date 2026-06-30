-- ============================================================================
--  种子数据：管理员账号 + 示例会议室 + 示例公告
--  默认管理员: admin / admin123 （BCrypt 加密后的密文）
--  默认员工:   alice / alice123  （BCrypt 加密后的密文）
--  BCrypt cost=10
-- ============================================================================

USE `meeting_room_db`;

-- 管理员
INSERT INTO `t_user` (id, username, password, nickname, employee_no, email, phone, department, role, status, created_at, updated_at)
VALUES (1, 'admin',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- admin123
        '系统管理员', 'A0001', 'admin@meetingroom.local', '13800000001', '行政部', 2, 1, NOW(), NOW());

-- 普通员工
INSERT INTO `t_user` (id, username, password, nickname, employee_no, email, phone, department, role, status, created_at, updated_at)
VALUES (2, 'alice',
        '$2a$10$7EqJtq98hPqEX7fNZaFWoO.A8WkPp4FwLnFC1iAEXJ.h2lFE3HZkS', -- alice123
        '艾莉丝', 'E1001', 'alice@meetingroom.local', '13800000002', '产品部', 1, 1, NOW(), NOW()),
       (3, 'bob',
        '$2a$10$7EqJtq98hPqEX7fNZaFWoO.A8WkPp4FwLnFC1iAEXJ.h2lFE3HZkS',
        '鲍勃', 'E1002', 'bob@meetingroom.local', '13800000003', '研发部', 1, 1, NOW(), NOW()),
       (4, 'charlie',
        '$2a$10$7EqJtq98hPqEX7fNZaFWoO.A8WkPp4FwLnFC1iAEXJ.h2lFE3HZkS',
        '查理', 'E1003', 'charlie@meetingroom.local', '13800000004', '设计部', 1, 1, NOW(), NOW());

-- 会议室
INSERT INTO `t_room` (id, name, floor, location, capacity, equipment, description, cover_image, need_approval, status, created_at, updated_at)
VALUES (101, '紫荆-小型会议室', '3F', '3F-301', 6,
        '投影仪,白板,无线网络', '适合小组讨论的小型会议室', NULL, 0, 1, NOW(), NOW()),
       (102, '海棠-中型会议室', '3F', '3F-305', 12,
        '投影仪,视频会议,白板,无线网络,音响', '适合部门例会与跨部门沟通', NULL, 0, 1, NOW(), NOW()),
       (103, '红枫-大型会议室', '5F', '5F-501', 30,
        '投影仪,视频会议,白板,音响,同传设备', '大型会议、培训、对外接待，使用需审批', NULL, 1, 1, NOW(), NOW()),
       (104, '银杏-头脑风暴室', '4F', '4F-402', 8,
        '白板,投影仪,无线网络', '极简风格，墙面可写', NULL, 0, 1, NOW(), NOW()),
       (105, '梧桐-路演厅', '1F', '1F-101', 50,
        '舞台,投影仪,音响,视频会议,无线网络', '大型路演与对外发布场地，使用需审批', NULL, 1, 1, NOW(), NOW()),
       (106, '香樟-视讯室', '2F', '2F-208', 10,
        '视频会议,投影仪,音响', '专为远程视讯会议设计', NULL, 0, 2, NOW(), NOW());

-- 系统公告
INSERT INTO `t_notice` (id, title, content, type, priority, publisher_id, status, publish_at, created_at, updated_at)
VALUES (1, '欢迎使用智能会议室预约管理系统',
        '本系统支持会议室在线预约、审批、签到、纪要管理与使用统计，旨在提升企业内部会议资源利用率。如有问题请联系行政部。',
        1, 1, 1, 1, NOW(), NOW(), NOW()),
       (2, '【维护通知】5F-501 会议室设备升级',
        '5F-501 红枫大会议室计划于本周末进行音响与同传设备升级，期间暂停使用，预计周一恢复，请合理安排。',
        2, 2, 1, 1, NOW(), NOW(), NOW());

-- 示例预约（演示用，全部历史/已通过状态）
INSERT INTO `t_reservation` (id, user_id, room_id, title, description, attendee_count, attendee_user_ids, start_time, end_time, status, created_at, updated_at)
VALUES (1001, 2, 101, '产品周会', '本周产品迭代进度同步', 5, '2,3,4', DATE_ADD(NOW(), INTERVAL 1 DAY),
        DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 1 HOUR), 1, NOW(), NOW()),
       (1002, 3, 102, '研发架构评审', '新版本架构设计评审', 8, '2,3,4', DATE_ADD(NOW(), INTERVAL 2 DAY),
        DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 2 HOUR), 1, NOW(), NOW()),
       (1003, 4, 103, '季度全员大会', '本季度业绩复盘', 25, NULL, DATE_ADD(NOW(), INTERVAL 3 DAY),
        DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 3 HOUR), 0, NOW(), NOW());

-- 对应的审批记录（仅需审批房间）
INSERT INTO `t_approval` (id, reservation_id, status, created_at, updated_at)
VALUES (1, 1003, 0, NOW(), NOW());
