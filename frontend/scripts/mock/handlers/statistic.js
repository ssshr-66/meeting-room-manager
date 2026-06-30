/**
 * Mock handlers - 统计：/admin/statistics/*
 */
(function () {
    'use strict';
    const D = MR.MockData;
    const H = MR.MockHelpers;
    const reg = (m, p, fn) => MR.Mock.register(m, p, fn);

    /** 每日工作时长（用于使用率） */
    const DAILY_AVAILABLE_HOURS = 12;

    function requireAdmin(cu) {
        if (!cu) throw H.bizError(1002, '未登录');
        if (cu.role !== 2) throw H.bizError(1003, '需要管理员权限');
    }

    /** 把 period 转成 [startMs, endMs) 与 days */
    function periodRange(period, baseDate) {
        const base = baseDate ? new Date(baseDate + 'T00:00:00') : startOfDay(new Date());
        let start, end;
        switch ((period || 'day').toLowerCase()) {
            case 'week': {
                // 以周一为一周开始
                const dow = (base.getDay() + 6) % 7;  // 0=Mon..6=Sun
                start = new Date(base); start.setDate(base.getDate() - dow); start.setHours(0,0,0,0);
                end = new Date(start); end.setDate(start.getDate() + 7);
                break;
            }
            case 'month': {
                start = new Date(base.getFullYear(), base.getMonth(), 1);
                end = new Date(base.getFullYear(), base.getMonth() + 1, 1);
                break;
            }
            case 'day':
            default: {
                start = startOfDay(base);
                end = new Date(start); end.setDate(start.getDate() + 1);
                break;
            }
        }
        return { start, end, days: Math.max(1, Math.round((end - start) / 86400_000)) };
    }
    function startOfDay(d) {
        const r = new Date(d); r.setHours(0,0,0,0); return r;
    }

    /** GET /admin/statistics/overview */
    reg('GET', '/admin/statistics/overview', async ({ currentUser }) => {
        requireAdmin(currentUser);
        const todayStart = startOfDay(new Date()).getTime();
        const todayEnd = todayStart + 86400_000;
        const today = D.reservations.filter(r => {
            const t = H.parseDt(r.startTime).getTime();
            return t >= todayStart && t < todayEnd;
        }).length;
        const pending = D.approvals.filter(a => a.status === 0).length;
        const inProgress = D.reservations.filter(r => r.status === 2).length;
        return {
            totalUsers: D.users.length,
            totalRooms: D.rooms.length,
            todayReservations: today,
            pendingApprovals: pending,
            activeReservations: inProgress,
        };
    });

    /** GET /admin/statistics/room-usage */
    reg('GET', '/admin/statistics/room-usage', async ({ currentUser, params }) => {
        requireAdmin(currentUser);
        return calcRoomUsage(params.period, params.baseDate);
    });

    /** GET /admin/statistics/top-rooms?limit=5 */
    reg('GET', '/admin/statistics/top-rooms', async ({ currentUser, params }) => {
        requireAdmin(currentUser);
        const limit = Math.max(1, Number(params.limit || 5));
        return calcRoomUsage(params.period, params.baseDate).slice(0, limit);
    });

    /** GET /admin/statistics/hour-distribution */
    reg('GET', '/admin/statistics/hour-distribution', async ({ currentUser, params }) => {
        requireAdmin(currentUser);
        const { start, end } = periodRange(params.period, params.baseDate);
        const buckets = new Array(24).fill(0);
        D.reservations.forEach(r => {
            if (![1, 2, 3].includes(r.status)) return;
            const t = H.parseDt(r.startTime);
            if (t < start || t >= end) return;
            buckets[t.getHours()]++;
        });
        return buckets.map((cnt, hour) => ({ hour, count: cnt }));
    });

    /* ===== 工具 ===== */

    function calcRoomUsage(period, baseDate) {
        const { start, end, days } = periodRange(period, baseDate);
        return D.rooms.map(room => {
            const list = D.reservations.filter(r =>
                r.roomId === room.id
                && [1, 2, 3].includes(r.status)
                && H.parseDt(r.startTime) >= start
                && H.parseDt(r.startTime) <  end
            );
            const totalMinutes = list.reduce((sum, r) =>
                sum + Math.max(0, (H.parseDt(r.endTime) - H.parseDt(r.startTime)) / 60_000), 0);
            const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
            const usageRate = Math.round((totalHours / (DAILY_AVAILABLE_HOURS * days)) * 1000) / 10;
            return {
                roomId: room.id,
                roomName: room.name,
                totalMinutes,
                totalHours,
                reservationCount: list.length,
                usageRate,
            };
        }).sort((a, b) => b.totalMinutes - a.totalMinutes);
    }
})();
