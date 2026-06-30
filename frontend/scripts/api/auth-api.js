/** 认证接口：登录 / 注册（白名单） */
(function () {
    'use strict';

    MR.AuthApi = {
        /** @returns {{token: string, user: object}} */
        login(username, password) {
            return MR.Request.post('/auth/login', { username, password }, { skipAuth: true });
        },

        register(payload) {
            return MR.Request.post('/auth/register', payload, { skipAuth: true });
        },
    };
})();
