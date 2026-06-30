/**
 * Mock handlers - 公告：/notices*, /admin/notices*
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

    /** GET /notices/public/latest?limit=5  -- 白名单，无需登录 */
    reg('GET', '/notices/public/latest', async ({ params }) => {
        const limit = Math.max(1, Math.min(20, Number(params.limit || 5)));
        const list = D.notices.filter(n => n.status === 1)
            .sort((a, b) => (b.priority || 0) - (a.priority || 0)
                         || String(b.publishAt || '').localeCompare(String(a.publishAt || '')))
            .slice(0, limit);
        return list.map(enrich);
    });

    /** GET /notices */
    reg('GET', '/notices', async ({ currentUser, params }) => {
        if (!currentUser) throw H.bizError(1002, '未登录');
        const list = filterNotices(D.notices.filter(n => n.status === 1), params)
            .sort((a, b) => (b.priority || 0) - (a.priority || 0)
                         || String(b.publishAt || '').localeCompare(String(a.publishAt || '')));
        const page = H.paginate(list, params);
        page.records = page.records.map(enrich);
        return page;
    });

    reg('GET', '/notices/:id', async ({ currentUser, pathParams }) => {
        if (!currentUser) throw H.bizError(1002, '未登录');
        const n = D.notices.find(x => x.id === Number(pathParams.id));
        if (!n) throw H.bizError(7001, '公告不存在');
        return enrich(n);
    });

    /* ===== 管理员 ===== */

    reg('GET', '/admin/notices', async ({ currentUser, params }) => {
        requireAdmin(currentUser);
        const list = filterNotices(D.notices.slice(), params)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const page = H.paginate(list, params);
        page.records = page.records.map(enrich);
        return page;
    });

    reg('POST', '/admin/notices', async ({ currentUser, body }) => {
        requireAdmin(currentUser);
        const b = body || {};
        if (!b.title || !b.content) throw H.bizError(1001, '标题和内容不能为空');
        const n = {
            id: D.nextId(),
            title: b.title,
            content: b.content,
            type: b.type ? Number(b.type) : 1,
            priority: b.priority != null ? Number(b.priority) : 0,
            publisherId: currentUser.id,
            status: b.status != null ? Number(b.status) : 1,
            publishAt: (b.status != null ? Number(b.status) : 1) === 1 ? D.now() : null,
            createdAt: D.now(), updatedAt: D.now(),
        };
        D.notices.push(n);
        return n.id;
    });

    reg('PUT', '/admin/notices/:id', async ({ currentUser, pathParams, body }) => {
        requireAdmin(currentUser);
        const id = Number(pathParams.id);
        const n = D.notices.find(x => x.id === id);
        if (!n) throw H.bizError(7001, '公告不存在');
        const b = body || {};
        if (b.title !== undefined)    n.title = b.title;
        if (b.content !== undefined)  n.content = b.content;
        if (b.type !== undefined)     n.type = Number(b.type);
        if (b.priority !== undefined) n.priority = Number(b.priority);
        if (b.status !== undefined) {
            const newStatus = Number(b.status);
            if (newStatus === 1 && !n.publishAt) n.publishAt = D.now();
            n.status = newStatus;
        }
        n.updatedAt = D.now();
        return null;
    });

    reg('DELETE', '/admin/notices/:id', async ({ currentUser, pathParams }) => {
        requireAdmin(currentUser);
        const id = Number(pathParams.id);
        const idx = D.notices.findIndex(x => x.id === id);
        if (idx < 0) throw H.bizError(7001, '公告不存在');
        D.notices.splice(idx, 1);
        return null;
    });

    /* ===== 工具 ===== */

    function filterNotices(list, params) {
        const type = params.type !== '' && params.type != null ? Number(params.type) : null;
        const status = params.status !== '' && params.status != null ? Number(params.status) : null;
        const kw = (params.keyword || '').trim().toLowerCase();
        return list.filter(n => {
            if (type !== null && n.type !== type) return false;
            if (status !== null && n.status !== status) return false;
            if (kw && !n.title.toLowerCase().includes(kw)) return false;
            return true;
        });
    }

    function enrich(n) {
        const u = D.users.find(x => x.id === n.publisherId);
        return Object.assign({}, n, {
            typeDesc: H.NTYPE_DESC[n.type] || '',
            priorityDesc: H.PRIO_DESC[n.priority || 0] || '普通',
            statusDesc: n.status === 1 ? '已发布' : '已下架',
            publisherNickname: u ? u.nickname : null,
        });
    }
})();
