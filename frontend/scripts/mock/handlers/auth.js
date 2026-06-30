/**
 * Mock handlers - 认证：/auth/login, /auth/register
 */
(function () {
    'use strict';
    const D = MR.MockData;
    const H = MR.MockHelpers;
    const reg = (m, p, fn) => MR.Mock.register(m, p, fn);

    /** POST /auth/login */
    reg('POST', '/auth/login', async ({ body }) => {
        const username = body && body.username;
        const password = body && body.password;
        if (!username || !password) throw H.bizError(1001, '用户名和密码不能为空');
        const u = D.users.find(x => x.username === username);
        if (!u) throw H.bizError(2002, '用户名或密码错误');
        if (u.password !== password) throw H.bizError(2002, '用户名或密码错误');
        if (u.status === 0) throw H.bizError(2003, '账号已被禁用');

        u.lastLoginAt = D.now();

        const token = H.makeFakeToken({ uid: u.id, uname: u.username, role: u.role });
        return { token, user: H.userVO(u) };
    });

    /** POST /auth/register */
    reg('POST', '/auth/register', async ({ body }) => {
        const b = body || {};
        if (!b.username || !b.password || !b.nickname || !b.email) {
            throw H.bizError(1001, '请填写所有必填字段');
        }
        if (D.users.some(x => x.username === b.username)) throw H.bizError(2004, '用户名已被注册');
        if (D.users.some(x => x.email === b.email))       throw H.bizError(2005, '邮箱已被注册');
        if (b.employeeNo && D.users.some(x => x.employeeNo === b.employeeNo)) {
            throw H.bizError(2006, '工号已存在');
        }
        const newUser = {
            id: D.nextId(),
            username: b.username,
            password: b.password,    // mock 明文存
            nickname: b.nickname,
            employeeNo: b.employeeNo || null,
            email: b.email,
            phone: b.phone || null,
            avatar: null,
            department: b.department || null,
            role: 1, status: 1,
            lastLoginAt: null,
            createdAt: D.now(), updatedAt: D.now(),
        };
        D.users.push(newUser);
        return H.userVO(newUser);
    });
})();
