/**
 * Mock 数据：内存仓库（CRUD 真实生效）。
 *
 * 包含：用户 / 会议室 / 预约 / 审批 / 公告 / 签到 / 纪要
 * 提供 __reset() 恢复初始数据。
 *
 * 时间格式约定：与后端 Jackson 输出一致 → "yyyy-MM-dd HH:mm:ss"
 */
(function () {
    'use strict';

    window.MR = window.MR || {};

    const MS_DAY = 86400_000;

    /** 格式化日期 -> "yyyy-MM-dd HH:mm:ss" */
    function fmt(d) {
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} `
             + `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    /** 偏移今天 N 天，时分秒为 hh:mm */
    function at(dayOffset, hh, mm) {
        const d = new Date();
        d.setDate(d.getDate() + dayOffset);
        d.setHours(hh || 0, mm || 0, 0, 0);
        return fmt(d);
    }

    /** 当前时刻偏移 N 分钟 */
    function nowOffset(minutes) {
        const d = new Date();
        d.setMinutes(d.getMinutes() + minutes);
        d.setSeconds(0, 0);
        return fmt(d);
    }

    /** 初始数据生成器（每次 reset 调用） */
    function buildSeed() {
        const now = fmt(new Date());

        const users = [
            { id: 1, username: 'admin',   password: 'admin123',   nickname: '系统管理员', employeeNo: 'A0001',
              email: 'admin@meetingroom.local',  phone: '13800000001', avatar: null, department: '行政部',
              role: 2, status: 1, lastLoginAt: now, createdAt: at(-30, 9, 0), updatedAt: now },
            { id: 2, username: 'alice',   password: 'alice123',   nickname: '艾莉丝', employeeNo: 'E1001',
              email: 'alice@meetingroom.local',  phone: '13800000002', avatar: null, department: '产品部',
              role: 1, status: 1, lastLoginAt: at(-1, 10, 30), createdAt: at(-25, 10, 0), updatedAt: now },
            { id: 3, username: 'bob',     password: 'bob123',     nickname: '鲍勃', employeeNo: 'E1002',
              email: 'bob@meetingroom.local',    phone: '13800000003', avatar: null, department: '研发部',
              role: 1, status: 1, lastLoginAt: at(-2, 14, 0), createdAt: at(-20, 11, 0), updatedAt: now },
            { id: 4, username: 'charlie', password: 'charlie123', nickname: '查理', employeeNo: 'E1003',
              email: 'charlie@meetingroom.local',phone: '13800000004', avatar: null, department: '设计部',
              role: 1, status: 1, lastLoginAt: at(-3, 15, 0), createdAt: at(-15, 9, 30), updatedAt: now },
            { id: 5, username: 'diana',   password: 'diana123',   nickname: '戴安娜', employeeNo: 'E1004',
              email: 'diana@meetingroom.local',  phone: '13800000005', avatar: null, department: '市场部',
              role: 1, status: 0, lastLoginAt: null, createdAt: at(-10, 16, 0), updatedAt: now },
        ];

        const rooms = [
            { id: 101, name: '紫荆-小型会议室', floor: '3F', location: '3F-301', capacity: 6,
              equipment: '投影仪,白板,无线网络', description: '适合小组讨论的小型会议室',
              coverImage: null, needApproval: 0, status: 1, createdAt: at(-30, 9, 0), updatedAt: now },
            { id: 102, name: '海棠-中型会议室', floor: '3F', location: '3F-305', capacity: 12,
              equipment: '投影仪,视频会议,白板,无线网络,音响', description: '适合部门例会与跨部门沟通',
              coverImage: null, needApproval: 0, status: 1, createdAt: at(-30, 9, 0), updatedAt: now },
            { id: 103, name: '红枫-大型会议室', floor: '5F', location: '5F-501', capacity: 30,
              equipment: '投影仪,视频会议,白板,音响,同传设备',
              description: '大型会议、培训、对外接待，使用需审批',
              coverImage: null, needApproval: 1, status: 1, createdAt: at(-30, 9, 0), updatedAt: now },
            { id: 104, name: '银杏-头脑风暴室', floor: '4F', location: '4F-402', capacity: 8,
              equipment: '白板,投影仪,无线网络', description: '极简风格，墙面可写',
              coverImage: null, needApproval: 0, status: 1, createdAt: at(-30, 9, 0), updatedAt: now },
            { id: 105, name: '梧桐-路演厅', floor: '1F', location: '1F-101', capacity: 50,
              equipment: '舞台,投影仪,音响,视频会议,无线网络',
              description: '大型路演与对外发布场地，使用需审批',
              coverImage: null, needApproval: 1, status: 1, createdAt: at(-30, 9, 0), updatedAt: now },
            { id: 106, name: '香樟-视讯室', floor: '2F', location: '2F-208', capacity: 10,
              equipment: '视频会议,投影仪,音响', description: '专为远程视讯会议设计',
              coverImage: null, needApproval: 0, status: 2, createdAt: at(-30, 9, 0), updatedAt: now },
        ];

        const reservations = [
            // 待审批：red 厅，3 天后
            { id: 4001, userId: 4, roomId: 103, title: '季度全员大会',
              description: '本季度业绩复盘 + 下季度目标对齐', attendeeCount: 25, attendeeUserIds: null,
              startTime: at(3, 14, 0), endTime: at(3, 17, 0),
              status: 0, cancelReason: null, createdAt: at(-1, 10, 0), updatedAt: at(-1, 10, 0) },
            // 已通过：明天
            { id: 4002, userId: 2, roomId: 101, title: '产品周会',
              description: '本周产品迭代进度同步', attendeeCount: 5, attendeeUserIds: '2,3,4',
              startTime: at(1, 10, 0), endTime: at(1, 11, 0),
              status: 1, cancelReason: null, createdAt: at(-2, 14, 0), updatedAt: at(-2, 14, 0) },
            // 已通过：后天
            { id: 4003, userId: 3, roomId: 102, title: '研发架构评审',
              description: '新版本架构设计评审', attendeeCount: 8, attendeeUserIds: '2,3,4',
              startTime: at(2, 14, 0), endTime: at(2, 16, 0),
              status: 1, cancelReason: null, createdAt: at(-3, 16, 0), updatedAt: at(-3, 16, 0) },
            // 进行中：当前时刻附近（前后各 1 小时），保证演示时一定可签到
            { id: 4004, userId: 2, roomId: 104, title: '设计评审会（进行中 - 可签到演示）',
              description: '新版首页设计稿评审 · 这条数据起止时间动态生成，保证演示时一定处于"会议进行中"状态',
              attendeeCount: 4, attendeeUserIds: '2,3,4',
              startTime: nowOffset(-60), endTime: nowOffset(60),
              status: 2, cancelReason: null, createdAt: at(-1, 9, 0), updatedAt: at(-1, 9, 0) },
            // 已完成：昨天
            { id: 4005, userId: 3, roomId: 101, title: '技术分享 - GraphQL',
              description: '内部技术分享', attendeeCount: 6, attendeeUserIds: '2,3,4',
              startTime: at(-1, 15, 0), endTime: at(-1, 16, 0),
              status: 3, cancelReason: null, createdAt: at(-5, 10, 0), updatedAt: at(-1, 16, 5) },
            // 已取消
            { id: 4006, userId: 4, roomId: 102, title: '取消的对接会',
              description: '客户改期', attendeeCount: 3, attendeeUserIds: null,
              startTime: at(1, 16, 0), endTime: at(1, 17, 0),
              status: 4, cancelReason: '客户临时取消', createdAt: at(-2, 11, 0), updatedAt: at(-1, 9, 0) },
            // 已驳回
            { id: 4007, userId: 2, roomId: 105, title: '路演厅占用申请（被驳回示例）',
              description: '内部分享', attendeeCount: 30, attendeeUserIds: null,
              startTime: at(4, 10, 0), endTime: at(4, 12, 0),
              status: 5, cancelReason: '审批驳回: 路演厅仅对外活动开放', createdAt: at(-1, 11, 0), updatedAt: at(0, 9, 0) },
            // 历史已完成 - 用于统计有数据
            { id: 4008, userId: 3, roomId: 102, title: '上周周会1', description: '', attendeeCount: 10,
              attendeeUserIds: '2,3,4', startTime: at(-6, 10, 0), endTime: at(-6, 11, 30),
              status: 3, cancelReason: null, createdAt: at(-7, 9, 0), updatedAt: at(-6, 11, 30) },
            { id: 4009, userId: 4, roomId: 101, title: '上周周会2', description: '', attendeeCount: 4,
              attendeeUserIds: '2,4', startTime: at(-5, 9, 0), endTime: at(-5, 10, 0),
              status: 3, cancelReason: null, createdAt: at(-7, 9, 0), updatedAt: at(-5, 10, 0) },
            { id: 4010, userId: 2, roomId: 102, title: '上周评审会', description: '', attendeeCount: 8,
              attendeeUserIds: '2,3,4', startTime: at(-4, 14, 0), endTime: at(-4, 16, 0),
              status: 3, cancelReason: null, createdAt: at(-7, 9, 0), updatedAt: at(-4, 16, 0) },
            { id: 4011, userId: 3, roomId: 104, title: '上周头脑风暴', description: '', attendeeCount: 6,
              attendeeUserIds: '2,3,4', startTime: at(-3, 10, 0), endTime: at(-3, 12, 0),
              status: 3, cancelReason: null, createdAt: at(-7, 9, 0), updatedAt: at(-3, 12, 0) },
        ];

        const approvals = [
            { id: 5001, reservationId: 4001, approverId: null, status: 0,
              rejectReason: null, remark: null, approvedAt: null,
              createdAt: at(-1, 10, 0), updatedAt: at(-1, 10, 0) },
            { id: 5002, reservationId: 4007, approverId: 1, status: 2,
              rejectReason: '路演厅仅对外活动开放，请改用 5F 红枫', remark: null, approvedAt: at(0, 9, 0),
              createdAt: at(-1, 11, 0), updatedAt: at(0, 9, 0) },
        ];

        const notices = [
            { id: 7001, title: '欢迎使用智能会议室预约管理系统',
              content: '本系统支持会议室在线预约、审批、签到、纪要管理与使用统计，旨在提升企业内部会议资源利用率。如有问题请联系行政部。',
              type: 1, priority: 1, publisherId: 1, status: 1,
              publishAt: at(-10, 9, 0), createdAt: at(-10, 9, 0), updatedAt: at(-10, 9, 0) },
            { id: 7002, title: '【维护通知】5F-501 会议室设备升级',
              content: '5F-501 红枫大会议室计划于本周末进行音响与同传设备升级，期间暂停使用，预计周一恢复，请合理安排。',
              type: 2, priority: 2, publisherId: 1, status: 1,
              publishAt: at(-2, 14, 0), createdAt: at(-2, 14, 0), updatedAt: at(-2, 14, 0) },
            { id: 7003, title: '【功能上新】支持日历视图浏览会议室',
              content: '会议室列表新增日历视图，可一眼查看全天占用情况，提升选房效率。',
              type: 1, priority: 0, publisherId: 1, status: 1,
              publishAt: at(-5, 10, 0), createdAt: at(-5, 10, 0), updatedAt: at(-5, 10, 0) },
        ];

        const signins = [
            { id: 9001, reservationId: 4005, userId: 3, signType: 1, signAt: at(-1, 14, 55), createdAt: at(-1, 14, 55) },
            { id: 9002, reservationId: 4005, userId: 2, signType: 2, signAt: at(-1, 14, 58), createdAt: at(-1, 14, 58) },
            { id: 9003, reservationId: 4005, userId: 4, signType: 1, signAt: at(-1, 15, 2),  createdAt: at(-1, 15, 2) },
        ];

        const minutes = [
            { id: 8001, reservationId: 4005, uploaderId: 3,
              title: '技术分享 - GraphQL 概要', content:
                  'GraphQL 与 REST 对比：\n1. 单一端点 vs 多端点\n2. 客户端按需取数 vs 服务端定形\n3. 强类型 schema 优势\n\n实际落地建议：先在新接口试点，逐步迁移。',
              attachmentUrl: 'https://example.com/share/graphql-intro.pdf',
              attachmentName: 'GraphQL 入门.pdf',
              createdAt: at(-1, 17, 0), updatedAt: at(-1, 17, 0) },
        ];

        return { users, rooms, reservations, approvals, notices, signins, minutes };
    }

    /* ============== 持久化（localStorage） ==============
     * 默认开启：业务操作（创建/修改/删除）后由 mock-router 自动调用 __save()
     * 让数据跨页面跳转 / 刷新 / 关浏览器都保留，更贴近演示体验。
     * 重置：MR.Mock.reset() → 清除存储并恢复初始数据。
     */
    const STORAGE_KEY = 'mr-mock-db-v1';
    const SEQ_KEY = 'mr-mock-seq-v1';

    function loadFromStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (!data || typeof data !== 'object') return null;
            return data;
        } catch (e) {
            console.warn('[MockData] 读取 localStorage 失败，回退到种子数据', e);
            return null;
        }
    }

    function saveToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            localStorage.setItem(SEQ_KEY, String(seq));
        } catch (e) {
            console.warn('[MockData] 写入 localStorage 失败', e);
        }
    }

    function clearStorage() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SEQ_KEY);
    }

    /** 暴露：DB（内存数据） + __reset / __save / __seq（ID 自增） */
    // 启动：优先从 localStorage 恢复，否则用种子数据初始化并写入
    let state;
    let seq;
    const persisted = loadFromStorage();
    if (persisted) {
        state = persisted;
        const savedSeq = parseInt(localStorage.getItem(SEQ_KEY) || '100000', 10);
        seq = Number.isFinite(savedSeq) ? savedSeq : 100_000;
        console.info('%c[MockData] 已从 localStorage 恢复 ' +
            (state.reservations ? state.reservations.length : 0) + ' 条预约数据',
            'color:#2bb673');
    } else {
        state = buildSeed();
        seq = 100_000;
        saveToStorage();
    }

    MR.MockData = {
        get users()         { return state.users; },
        get rooms()         { return state.rooms; },
        get reservations()  { return state.reservations; },
        get approvals()     { return state.approvals; },
        get notices()       { return state.notices; },
        get signins()       { return state.signins; },
        get minutes()       { return state.minutes; },

        /** 取下一个 ID（用于 insert） */
        nextId() { return ++seq; },

        /** 重置为初始种子数据（并清除 localStorage） */
        __reset() {
            const fresh = buildSeed();
            state.users        = fresh.users;
            state.rooms        = fresh.rooms;
            state.reservations = fresh.reservations;
            state.approvals    = fresh.approvals;
            state.notices      = fresh.notices;
            state.signins      = fresh.signins;
            state.minutes      = fresh.minutes;
            seq = 100_000;
            clearStorage();
            saveToStorage();
        },

        /** 持久化到 localStorage（mock-router 在写操作后自动调用） */
        __save: saveToStorage,

        /** 工具：克隆，避免对外暴露内部引用 */
        clone(o) { return JSON.parse(JSON.stringify(o)); },

        /** 工具：格式化时间 */
        now() { return fmt(new Date()); },
        fmt,
    };
})();
