/**
 * Mock 工具：分页、关键字过滤、富化（关联用户/会议室）、枚举描述、伪 JWT。
 */
(function () {
    'use strict';

    window.MR = window.MR || {};

    /* ============== 枚举描述 ============== */
    const ROLE_DESC   = { 1: '普通员工', 2: '管理员' };
    const USTAT_DESC  = { 0: '禁用',   1: '正常' };
    const RSTAT_DESC  = { 0: '停用',   1: '可用',   2: '维护中' };
    const RES_DESC    = { 0: '待审批', 1: '已通过', 2: '进行中', 3: '已完成', 4: '已取消', 5: '已驳回' };
    const APPR_DESC   = { 0: '待审批', 1: '通过',   2: '驳回' };
    const NTYPE_DESC  = { 1: '系统公告', 2: '维护通知' };
    const SIGN_DESC   = { 1: '扫码签到', 2: '手动签到' };
    const PRIO_DESC   = { 0: '普通',   1: '重要',   2: '紧急' };

    /* ============== 分页 ============== */

    /**
     * 分页+排序+总数封装。
     * @param {Array} list 已过滤的全集
     * @param {{pageNum?: number, pageSize?: number}} params
     */
    function paginate(list, params) {
        const pageNum = Number(params.pageNum || 1);
        const pageSize = Number(params.pageSize || 20);
        const total = list.length;
        const start = (pageNum - 1) * pageSize;
        const records = list.slice(start, start + pageSize);
        return { total, pageNum, pageSize, records };
    }

    /* ============== 富化 ============== */

    /** 把 User 转换为 UserVO */
    function userVO(u) {
        if (!u) return null;
        const { password, ...rest } = u;
        return Object.assign({}, rest, {
            roleDesc: ROLE_DESC[u.role] || '',
            statusDesc: USTAT_DESC[u.status] || '',
        });
    }

    /** 把 Room 转换为 RoomVO */
    function roomVO(r) {
        if (!r) return null;
        const eqList = !r.equipment ? []
            : String(r.equipment).split(/[,，]/).map(s => s.trim()).filter(Boolean);
        return Object.assign({}, r, {
            equipmentList: eqList,
            statusDesc: RSTAT_DESC[r.status] || '',
        });
    }

    /** 把 Reservation 富化（关联 room、user） */
    function reservationVO(r, ctx) {
        if (!r) return null;
        const room = ctx.roomMap.get(r.roomId);
        const user = ctx.userMap.get(r.userId);
        const attendeeIds = !r.attendeeUserIds ? []
            : String(r.attendeeUserIds).split(',').map(s => s.trim()).filter(Boolean).map(Number);
        return {
            id: r.id, userId: r.userId,
            userNickname: user ? user.nickname : null,
            userEmployeeNo: user ? user.employeeNo : null,
            roomId: r.roomId,
            roomName: room ? room.name : null,
            roomFloor: room ? room.floor : null,
            title: r.title, description: r.description,
            attendeeCount: r.attendeeCount,
            attendeeUserIds: attendeeIds,
            startTime: r.startTime, endTime: r.endTime,
            status: r.status, statusDesc: RES_DESC[r.status] || '',
            cancelReason: r.cancelReason,
            ownByMe: ctx.currentUserId === r.userId,
            createdAt: r.createdAt,
        };
    }

    /** 构造富化上下文（一次性预查 room+user，避免多次循环） */
    function buildCtx(currentUserId) {
        const D = MR.MockData;
        const roomMap = new Map(D.rooms.map(r => [r.id, r]));
        const userMap = new Map(D.users.map(u => [u.id, u]));
        return { roomMap, userMap, currentUserId };
    }

    /* ============== 时间冲突检测 ============== */

    /**
     * 检测某会议室在 [start, end) 内是否有冲突（排除自身）。
     * status 0/1/2 视为占用。
     */
    function hasConflict(roomId, startStr, endStr, excludeId) {
        const start = parseDt(startStr);
        const end = parseDt(endStr);
        return MR.MockData.reservations.some(r => {
            if (r.roomId !== roomId) return false;
            if (excludeId && r.id === excludeId) return false;
            if (![0, 1, 2].includes(r.status)) return false;
            const rs = parseDt(r.startTime);
            const re = parseDt(r.endTime);
            return !(re <= start || rs >= end);  // 区间相交
        });
    }

    function parseDt(s) {
        if (!s) return new Date(0);
        if (s instanceof Date) return s;
        return new Date(String(s).replace(' ', 'T'));
    }

    /* ============== 路径模式匹配 ============== */

    /**
     * 把 "/admin/users/:id/status" 编译成 RegExp，并返回参数名列表。
     */
    function compilePattern(p) {
        const params = [];
        const re = new RegExp('^' + p.replace(/:([a-zA-Z_]\w*)/g, (_, name) => {
            params.push(name);
            return '([^/]+)';
        }) + '$');
        return { re, params };
    }

    /** 测试 url 是否匹配 pattern，返回 path params 对象或 null */
    function matchPath(pathOnly, compiled) {
        const m = pathOnly.match(compiled.re);
        if (!m) return null;
        const o = {};
        compiled.params.forEach((name, i) => { o[name] = decodeURIComponent(m[i + 1]); });
        return o;
    }

    /* ============== 伪 JWT ============== */

    function makeFakeToken(payload) {
        const json = JSON.stringify(Object.assign({ exp: Date.now() + 86400_000 }, payload));
        // 不做真签名，仅 base64 便于眼看；mock 拦截器内部不校验
        return 'mock.' + btoa(unescape(encodeURIComponent(json))) + '.sig';
    }

    function parseFakeToken(token) {
        if (!token || !token.startsWith('mock.')) return null;
        try {
            const json = decodeURIComponent(escape(atob(token.split('.')[1])));
            return JSON.parse(json);
        } catch (e) { return null; }
    }

    /* ============== 错误抛出（与 RequestError 同构） ============== */

    function bizError(code, message) {
        // 与 frontend/scripts/api/request.js 中的 RequestError 形态一致
        const err = new Error(message);
        err.name = 'RequestError';
        err.code = code;
        return err;
    }

    /* ============== 导出 ============== */
    MR.MockHelpers = {
        ROLE_DESC, USTAT_DESC, RSTAT_DESC, RES_DESC, APPR_DESC, NTYPE_DESC, SIGN_DESC, PRIO_DESC,
        paginate,
        userVO, roomVO, reservationVO,
        buildCtx,
        hasConflict, parseDt,
        compilePattern, matchPath,
        makeFakeToken, parseFakeToken,
        bizError,
    };
})();
