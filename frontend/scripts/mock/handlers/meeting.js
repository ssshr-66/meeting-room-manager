/**
 * Mock handlers - 会议：/meetings/{reservationId}/qrcode, /meetings/signin,
 *                       /meetings/{reservationId}/signins, /meetings/minutes
 */
(function () {
    'use strict';
    const D = MR.MockData;
    const H = MR.MockHelpers;
    const reg = (m, p, fn) => MR.Mock.register(m, p, fn);

    function requireLogin(cu) {
        if (!cu) throw H.bizError(1002, '未登录');
    }

    /* ===== 生成签到二维码（组织者） ===== */

    reg('GET', '/meetings/:reservationId/qrcode', async ({ currentUser, pathParams }) => {
        requireLogin(currentUser);
        const id = Number(pathParams.reservationId);
        const r = D.reservations.find(x => x.id === id);
        if (!r) throw H.bizError(4001, '预约不存在');
        if (r.userId !== currentUser.id) throw H.bizError(1003, '仅会议组织者可生成签到码');
        const expireAt = Date.now() + 30 * 60_000;
        const signToken = 'mock-' + id + '-' + expireAt.toString(36);
        return {
            reservationId: id,
            signToken,
            qrContent: `mr-signin://reservation/${id}?t=${signToken}&exp=${expireAt}`,
            expireAt,
        };
    });

    /* ===== 签到 ===== */

    reg('POST', '/meetings/signin', async ({ currentUser, body }) => {
        requireLogin(currentUser);
        const id = body && Number(body.reservationId);
        if (!id) throw H.bizError(1001, 'reservationId 不能为空');
        const r = D.reservations.find(x => x.id === id);
        if (!r) throw H.bizError(4001, '预约不存在');

        const now = new Date();
        const start = H.parseDt(r.startTime);
        const end   = H.parseDt(r.endTime);
        if (now < new Date(start.getTime() - 30 * 60_000)) {
            throw H.bizError(6002, '会议尚未开始（提前 30 分钟内可签到）');
        }
        if (now > end) throw H.bizError(6003, '会议已结束，无法签到');

        const uid = currentUser.id;
        const isAttendee = r.userId === uid
            || (r.attendeeUserIds && r.attendeeUserIds.split(',').map(s => s.trim()).includes(String(uid)));
        if (!isAttendee) throw H.bizError(6004, '您不在本次会议的参会名单中');

        if (D.signins.some(s => s.reservationId === id && s.userId === uid)) {
            throw H.bizError(6001, '您已签到，请勿重复签到');
        }

        const sid = D.nextId();
        const s = {
            id: sid,
            reservationId: id,
            userId: uid,
            signType: Number(body.signType || 2),
            signAt: D.now(),
            createdAt: D.now(),
        };
        D.signins.push(s);

        // 自动转 IN_PROGRESS
        if (r.status === 1 && now >= start) {
            r.status = 2;
            r.updatedAt = D.now();
        }
        return enrichSignin(s);
    });

    /* ===== 签到列表 ===== */

    reg('GET', '/meetings/:reservationId/signins', async ({ currentUser, pathParams }) => {
        requireLogin(currentUser);
        const id = Number(pathParams.reservationId);
        const list = D.signins.filter(s => s.reservationId === id)
            .sort((a, b) => a.signAt.localeCompare(b.signAt));
        return list.map(enrichSignin);
    });

    /* ===== 纪要 CRUD ===== */

    reg('POST', '/meetings/minutes', async ({ currentUser, body }) => {
        requireLogin(currentUser);
        const b = body || {};
        if (!b.reservationId) throw H.bizError(1001, 'reservationId 不能为空');
        const r = D.reservations.find(x => x.id === Number(b.reservationId));
        if (!r) throw H.bizError(4001, '预约不存在');
        if (!b.title || !String(b.title).trim()) throw H.bizError(1001, '标题不能为空');
        const m = {
            id: D.nextId(),
            reservationId: Number(b.reservationId),
            uploaderId: currentUser.id,
            title: b.title.trim(),
            content: b.content || null,
            attachmentUrl: b.attachmentUrl || null,
            attachmentName: b.attachmentName || null,
            createdAt: D.now(), updatedAt: D.now(),
        };
        D.minutes.push(m);
        return m.id;
    });

    reg('DELETE', '/meetings/minutes/:id', async ({ currentUser, pathParams }) => {
        requireLogin(currentUser);
        const id = Number(pathParams.id);
        const idx = D.minutes.findIndex(x => x.id === id);
        if (idx < 0) throw H.bizError(6005, '会议纪要不存在');
        const m = D.minutes[idx];
        if (m.uploaderId !== currentUser.id && currentUser.role !== 2) {
            throw H.bizError(1003, '无权限删除他人纪要');
        }
        D.minutes.splice(idx, 1);
        return null;
    });

    reg('GET', '/meetings/:reservationId/minutes', async ({ currentUser, pathParams }) => {
        requireLogin(currentUser);
        const id = Number(pathParams.reservationId);
        const list = D.minutes.filter(m => m.reservationId === id)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        return list.map(m => {
            const u = D.users.find(x => x.id === m.uploaderId);
            return Object.assign({}, m, { uploaderNickname: u ? u.nickname : null });
        });
    });

    /* ===== 工具 ===== */

    function enrichSignin(s) {
        const u = D.users.find(x => x.id === s.userId);
        return {
            id: s.id,
            reservationId: s.reservationId,
            userId: s.userId,
            userNickname: u ? u.nickname : null,
            signType: s.signType,
            signTypeDesc: H.SIGN_DESC[s.signType] || '',
            signAt: s.signAt,
        };
    }
})();
