/**
 * Mock handlers - 会议室：/rooms*, /admin/rooms*
 */
(function () {
    'use strict';
    const D = MR.MockData;
    const H = MR.MockHelpers;
    const reg = (m, p, fn) => MR.Mock.register(m, p, fn);

    function requireAdmin(cu) {
        if (!cu) throw H.bizError(1002, '未登录');
        if (cu.role !== 2) throw H.bizError(1003, '需要管理员权限');
    }

    /* ===== 用户端 ===== */

    reg('GET', '/rooms', async ({ params, currentUser }) => {
        if (!currentUser) throw H.bizError(1002, '未登录');
        const kw = (params.keyword || '').trim().toLowerCase();
        const floor = (params.floor || '').trim();
        const minCap = params.minCapacity ? Number(params.minCapacity) : null;
        const equipment = (params.equipment || '').trim();
        const status = params.status !== '' && params.status != null ? Number(params.status) : null;

        let list = D.rooms.filter(r => {
            if (kw && !r.name.toLowerCase().includes(kw)) return false;
            if (floor && r.floor !== floor) return false;
            if (minCap !== null && r.capacity < minCap) return false;
            if (equipment && (!r.equipment || !r.equipment.includes(equipment))) return false;
            if (status !== null && r.status !== status) return false;
            return true;
        });
        list = list.sort((a, b) => a.floor.localeCompare(b.floor) || a.name.localeCompare(b.name));
        const page = H.paginate(list, params);
        page.records = page.records.map(H.roomVO);
        return page;
    });

    reg('GET', '/rooms/all', async ({ params, currentUser }) => {
        if (!currentUser) throw H.bizError(1002, '未登录');
        const status = params.status !== '' && params.status != null ? Number(params.status) : null;
        let list = D.rooms.filter(r => status === null || r.status === status);
        list = list.sort((a, b) => a.floor.localeCompare(b.floor) || a.name.localeCompare(b.name));
        return list.map(H.roomVO);
    });

    reg('GET', '/rooms/:id', async ({ pathParams, currentUser }) => {
        if (!currentUser) throw H.bizError(1002, '未登录');
        const r = D.rooms.find(x => x.id === Number(pathParams.id));
        if (!r) throw H.bizError(3001, '会议室不存在');
        return H.roomVO(r);
    });

    reg('GET', '/rooms/:id/schedule', async ({ pathParams, params, currentUser }) => {
        if (!currentUser) throw H.bizError(1002, '未登录');
        const id = Number(pathParams.id);
        const room = D.rooms.find(x => x.id === id);
        if (!room) throw H.bizError(3001, '会议室不存在');
        const date = (params.date || D.now().slice(0, 10));
        const dayStart = date + ' 00:00:00';
        const dayEnd   = date + ' 23:59:59';
        const ctx = H.buildCtx(currentUser.id);
        const slots = D.reservations
            .filter(r =>
                r.roomId === id
                && [0, 1, 2].includes(r.status)
                && r.startTime >= dayStart && r.startTime <= dayEnd)
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map(r => ({
                reservationId: r.id,
                title: r.title,
                userNickname: ctx.userMap.get(r.userId) ? ctx.userMap.get(r.userId).nickname : null,
                startTime: r.startTime, endTime: r.endTime,
                status: r.status, statusDesc: H.RES_DESC[r.status] || '',
            }));
        return { roomId: room.id, roomName: room.name, date, slots };
    });

    /* ===== 管理员 ===== */

    reg('POST', '/admin/rooms', async ({ currentUser, body }) => {
        requireAdmin(currentUser);
        const b = body || {};
        if (!b.name || !b.floor || b.capacity == null) throw H.bizError(1001, '请填写必填字段');
        if (D.rooms.some(r => r.name === b.name)) throw H.bizError(3003, '会议室名称已存在');
        const room = {
            id: D.nextId(),
            name: b.name, floor: b.floor, location: b.location || null,
            capacity: Number(b.capacity), equipment: b.equipment || null,
            description: b.description || null, coverImage: b.coverImage || null,
            needApproval: b.needApproval ? 1 : 0,
            status: b.status != null ? Number(b.status) : 1,
            createdAt: D.now(), updatedAt: D.now(),
        };
        D.rooms.push(room);
        return room.id;
    });

    reg('PUT', '/admin/rooms/:id', async ({ currentUser, pathParams, body }) => {
        requireAdmin(currentUser);
        const id = Number(pathParams.id);
        const r = D.rooms.find(x => x.id === id);
        if (!r) throw H.bizError(3001, '会议室不存在');
        const b = body || {};
        if (b.name && b.name !== r.name
            && D.rooms.some(x => x.name === b.name && x.id !== id)) {
            throw H.bizError(3003, '会议室名称已存在');
        }
        ['name', 'floor', 'location', 'equipment', 'description', 'coverImage'].forEach(k => {
            if (b[k] !== undefined) r[k] = b[k] || null;
        });
        if (b.capacity != null)     r.capacity = Number(b.capacity);
        if (b.needApproval != null) r.needApproval = b.needApproval ? 1 : 0;
        if (b.status != null)       r.status = Number(b.status);
        r.updatedAt = D.now();
        return null;
    });

    reg('DELETE', '/admin/rooms/:id', async ({ currentUser, pathParams }) => {
        requireAdmin(currentUser);
        const id = Number(pathParams.id);
        const idx = D.rooms.findIndex(x => x.id === id);
        if (idx < 0) throw H.bizError(3001, '会议室不存在');
        const hasActive = D.reservations.some(r =>
            r.roomId === id && [0, 1, 2].includes(r.status));
        if (hasActive) throw H.bizError(3004, '会议室存在未完成的预约，不能删除');
        D.rooms.splice(idx, 1);
        return null;
    });
})();
