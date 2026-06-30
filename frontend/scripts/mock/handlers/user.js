/**
 * Mock handlers - 用户：/users/me*, /admin/users*
 */
(function () {
    'use strict';
    const D = MR.MockData;
    const H = MR.MockHelpers;
    const reg = (m, p, fn) => MR.Mock.register(m, p, fn);

    function requireLogin(cu) {
        if (!cu) throw H.bizError(1002, '未登录或登录已过期');
        return cu;
    }
    function requireAdmin(cu) {
        requireLogin(cu);
        if (cu.role !== 2) throw H.bizError(1003, '需要管理员权限');
    }

    /* ===== 当前用户 ===== */

    reg('GET', '/users/me', async ({ currentUser }) => {
        requireLogin(currentUser);
        return H.userVO(currentUser);
    });

    reg('PUT', '/users/me', async ({ currentUser, body }) => {
        requireLogin(currentUser);
        const b = body || {};
        if (b.email && b.email !== currentUser.email
            && D.users.some(x => x.email === b.email && x.id !== currentUser.id)) {
            throw H.bizError(2005, '邮箱已被注册');
        }
        ['nickname', 'email', 'phone', 'department', 'avatar'].forEach(k => {
            if (b[k] !== undefined) currentUser[k] = b[k] || null;
        });
        currentUser.updatedAt = D.now();
        return H.userVO(currentUser);
    });

    reg('PUT', '/users/me/password', async ({ currentUser, body }) => {
        requireLogin(currentUser);
        const b = body || {};
        if (!b.oldPassword || !b.newPassword) throw H.bizError(1001, '密码不能为空');
        if (currentUser.password !== b.oldPassword) throw H.bizError(2007, '原密码不正确');
        currentUser.password = b.newPassword;
        currentUser.updatedAt = D.now();
        return null;
    });

    /* ===== 管理员：用户管理 ===== */

    reg('GET', '/admin/users', async ({ currentUser, params }) => {
        requireAdmin(currentUser);
        const kw = (params.keyword || '').trim().toLowerCase();
        const role = params.role !== '' && params.role != null ? Number(params.role) : null;
        const status = params.status !== '' && params.status != null ? Number(params.status) : null;
        let list = D.users.filter(u => {
            if (role !== null && u.role !== role) return false;
            if (status !== null && u.status !== status) return false;
            if (kw) {
                const hit = [u.username, u.nickname, u.email, u.employeeNo]
                    .filter(Boolean).some(s => s.toLowerCase().includes(kw));
                if (!hit) return false;
            }
            return true;
        });
        list = list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        const page = H.paginate(list, params);
        page.records = page.records.map(H.userVO);
        return page;
    });

    /** PUT /admin/users/:id/status?status=0|1 */
    reg('PUT', '/admin/users/:id/status', async ({ currentUser, pathParams, params }) => {
        requireAdmin(currentUser);
        const id = Number(pathParams.id);
        const status = Number(params.status);
        if (![0, 1].includes(status)) throw H.bizError(1001, 'status 必须是 0 或 1');
        if (id === currentUser.id) throw H.bizError(2008, '不能禁用自己的账号');
        const u = D.users.find(x => x.id === id);
        if (!u) throw H.bizError(2001, '用户不存在');
        u.status = status;
        u.updatedAt = D.now();
        return null;
    });
})();
