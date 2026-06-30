/**
 * Mock handlers - 预约：/reservations*, /admin/reservations*
 */
(function () {
    'use strict';
    const D = MR.MockData;
    const H = MR.MockHelpers;
    const reg = (m, p, fn) => MR.Mock.register(m, p, fn);

    function requireLogin(cu) {
        if (!cu) throw H.bizError(1002, '未登录');
    }
    function requireAdmin(cu) {
        requireLogin(cu);
        if (cu.role !== 2) throw H.bizError(1003, '需要管理员权限');
    }

    /* ===== 通用校验 ===== */

    function validateTimeRange(startStr, endStr) {
        if (!startStr || !endStr) throw H.bizError(4003, '开始或结束时间不能为空');
        const s = H.parseDt(startStr);
        const e = H.parseDt(endStr);
        if (e <= s) throw H.bizError(4003, '结束时间必须晚于开始时间');
        if (s < new Date(Date.now() - 60_000)) throw H.bizError(4003, '开始时间不能早于当前时间');
        const hours = (e - s) / 3600_000;
        if (hours > 8) throw H.bizError(4007, '单次预约时长不能超过 8 小时');
    }

    /* ===== 创建 ===== */

    reg('POST', '/reservations', async ({ currentUser, body }) => {
        requireLogin(currentUser);
        const b = body || {};
        validateTimeRange(b.startTime, b.endTime);
        const room = D.rooms.find(r => r.id === Number(b.roomId));
        if (!room) throw H.bizError(3001, '会议室不存在');
        if (room.status !== 1) throw H.bizError(3002, '会议室当前不可用');
        if (Number(b.attendeeCount) > room.capacity) {
            throw H.bizError(4006, `参会人数 ${b.attendeeCount} 超过会议室容量 ${room.capacity}`);
        }
        if (H.hasConflict(room.id, b.startTime, b.endTime, null)) {
            throw H.bizError(4002, '所选时段已被占用');
        }

        const needApproval = room.needApproval === 1;
        const id = D.nextId();
        const attendeeIds = Array.isArray(b.attendeeUserIds) ? b.attendeeUserIds.join(',') : null;
        const r = {
            id,
            userId: currentUser.id,
            roomId: room.id,
            title: b.title,
            description: b.description || null,
            attendeeCount: Number(b.attendeeCount),
            attendeeUserIds: attendeeIds,
            startTime: b.startTime,
            endTime: b.endTime,
            status: needApproval ? 0 : 1,
            cancelReason: null,
            createdAt: D.now(), updatedAt: D.now(),
        };
        D.reservations.push(r);
        if (needApproval) {
            D.approvals.push({
                id: D.nextId(),
                reservationId: id, approverId: null, status: 0,
                rejectReason: null, remark: null, approvedAt: null,
                createdAt: D.now(), updatedAt: D.now(),
            });
        }
        return id;
    });

    /* ===== 修改 ===== */

    reg('PUT', '/reservations/:id', async ({ currentUser, pathParams, body }) => {
        requireLogin(currentUser);
        const id = Number(pathParams.id);
        const r = D.reservations.find(x => x.id === id);
        if (!r) throw H.bizError(4001, '预约记录不存在');
        if (r.userId !== currentUser.id) throw H.bizError(1003, '无权限修改他人预约');
        if (![0, 1].includes(r.status)) throw H.bizError(4005, '当前状态不可修改');

        const b = body || {};
        const targetRoomId = b.roomId != null ? Number(b.roomId) : r.roomId;
        const newStart = b.startTime || r.startTime;
        const newEnd   = b.endTime   || r.endTime;
        validateTimeRange(newStart, newEnd);
        const room = D.rooms.find(x => x.id === targetRoomId);
        if (!room) throw H.bizError(3001, '会议室不存在');
        if (room.status !== 1) throw H.bizError(3002, '会议室当前不可用');
        const cnt = b.attendeeCount != null ? Number(b.attendeeCount) : r.attendeeCount;
        if (cnt > room.capacity) throw H.bizError(4006, '参会人数超过会议室容量');
        if (H.hasConflict(targetRoomId, newStart, newEnd, id)) {
            throw H.bizError(4002, '所选时段已被占用');
        }

        r.roomId = targetRoomId;
        r.startTime = newStart;
        r.endTime = newEnd;
        r.attendeeCount = cnt;
        if (b.title !== undefined)        r.title = b.title;
        if (b.description !== undefined)  r.description = b.description || null;
        if (b.attendeeUserIds !== undefined) {
            r.attendeeUserIds = Array.isArray(b.attendeeUserIds) ? b.attendeeUserIds.join(',') : null;
        }
        r.updatedAt = D.now();
        return null;
    });

    /* ===== 取消 ===== */

    reg('POST', '/reservations/:id/cancel', async ({ currentUser, pathParams, body }) => {
        requireLogin(currentUser);
        const id = Number(pathParams.id);
        const r = D.reservations.find(x => x.id === id);
        if (!r) throw H.bizError(4001, '预约记录不存在');
        if (r.userId !== currentUser.id) throw H.bizError(1003, '无权限取消他人预约');
        if (![0, 1, 2].includes(r.status)) throw H.bizError(4004, '当前状态不可取消');
        r.status = 4;
        r.cancelReason = (body && body.reason) ? body.reason : '用户取消';
        r.updatedAt = D.now();
        return null;
    });

    /* ===== 详情 ===== */

    reg('GET', '/reservations/:id', async ({ currentUser, pathParams }) => {
        requireLogin(currentUser);
        const r = D.reservations.find(x => x.id === Number(pathParams.id));
        if (!r) throw H.bizError(4001, '预约记录不存在');
        const ctx = H.buildCtx(currentUser.id);
        return H.reservationVO(r, ctx);
    });

    /* ===== 我的预约 ===== */

    reg('GET', '/reservations/my', async ({ currentUser, params }) => {
        requireLogin(currentUser);
        const list = filterReservations(D.reservations.filter(r => r.userId === currentUser.id), params);
        list.sort((a, b) => b.startTime.localeCompare(a.startTime));
        const page = H.paginate(list, params);
        const ctx = H.buildCtx(currentUser.id);
        page.records = page.records.map(r => H.reservationVO(r, ctx));
        return page;
    });

    /* ===== 我即将参与的会议 ===== */

    reg('GET', '/reservations/my/upcoming', async ({ currentUser }) => {
        requireLogin(currentUser);
        const now = D.now();
        const uid = currentUser.id;
        const list = D.reservations.filter(r => {
            const involved = r.userId === uid
                || (r.attendeeUserIds && r.attendeeUserIds.split(',').map(s => s.trim()).includes(String(uid)));
            if (!involved) return false;
            if (![0, 1, 2].includes(r.status)) return false;
            return r.endTime >= now;
        }).sort((a, b) => a.startTime.localeCompare(b.startTime));
        const ctx = H.buildCtx(uid);
        return list.map(r => H.reservationVO(r, ctx));
    });

    /* ===== 管理员：全量分页 ===== */

    reg('GET', '/admin/reservations', async ({ currentUser, params }) => {
        requireAdmin(currentUser);
        let list = D.reservations.slice();
        if (params.userId) list = list.filter(r => r.userId === Number(params.userId));
        list = filterReservations(list, params);
        list.sort((a, b) => b.startTime.localeCompare(a.startTime));
        const page = H.paginate(list, params);
        const ctx = H.buildCtx(currentUser.id);
        page.records = page.records.map(r => H.reservationVO(r, ctx));
        return page;
    });

    /* ===== 管理员：强制取消 ===== */

    reg('POST', '/admin/reservations/:id/cancel', async ({ currentUser, pathParams, params }) => {
        requireAdmin(currentUser);
        const id = Number(pathParams.id);
        const r = D.reservations.find(x => x.id === id);
        if (!r) throw H.bizError(4001, '预约记录不存在');
        if (![0, 1, 2].includes(r.status)) throw H.bizError(4004, '当前状态不可取消');
        r.status = 4;
        r.cancelReason = '管理员取消: ' + (params.reason || '违规预约');
        r.updatedAt = D.now();
        return null;
    });

    /* ===== 工具 ===== */

    function filterReservations(list, params) {
        const status = params.status !== '' && params.status != null ? Number(params.status) : null;
        const roomId = params.roomId ? Number(params.roomId) : null;
        const kw = (params.keyword || '').trim().toLowerCase();
        const startDate = params.startDate ? (params.startDate + ' 00:00:00') : null;
        const endDate   = params.endDate   ? (params.endDate   + ' 23:59:59') : null;
        return list.filter(r => {
            if (status !== null && r.status !== status) return false;
            if (roomId !== null && r.roomId !== roomId) return false;
            if (kw && !r.title.toLowerCase().includes(kw)) return false;
            if (startDate && r.startTime < startDate) return false;
            if (endDate   && r.startTime > endDate) return false;
            return true;
        });
    }
})();
