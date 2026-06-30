/**
 * 登录态管理。
 *
 * 提供 token / 当前用户 的读写、登出、登录跳转等。
 * 后续业务模块通过 MR.Auth.getToken() 取 token，通过 MR.Auth.requireLogin() 强制鉴权。
 */
(function () {
    'use strict';

    const TOKEN_KEY = MR.Constants.TOKEN_KEY;
    const USER_KEY = MR.Constants.USER_KEY;

    MR.Auth = {
        /** 保存登录信息 */
        login(token, user) {
            MR.Storage.set(TOKEN_KEY, token);
            MR.Storage.set(USER_KEY, user || null);
        },

        /** 取 token */
        getToken() {
            return MR.Storage.get(TOKEN_KEY, null);
        },

        /** 取当前用户 */
        getUser() {
            return MR.Storage.get(USER_KEY, null);
        },

        /** 是否已登录 */
        isLoggedIn() {
            return !!MR.Storage.get(TOKEN_KEY, null);
        },

        /** 是否管理员 */
        isAdmin() {
            const u = MR.Storage.get(USER_KEY, null);
            return !!u && u.role === MR.Enums.UserRole.ADMIN;
        },

        /** 清除登录态 */
        logout() {
            MR.Storage.remove(TOKEN_KEY);
            MR.Storage.remove(USER_KEY);
        },

        /** 跳转登录页（后续可注入 redirect 参数） */
        redirectToLogin() {
            window.location.href = '/pages/user/login.html';
        },

        /** 未登录则跳转，已登录返回 true */
        requireLogin() {
            if (!this.isLoggedIn()) {
                this.redirectToLogin();
                return false;
            }
            return true;
        },
    };
})();
