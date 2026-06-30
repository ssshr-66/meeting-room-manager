/** 当前登录用户：个人信息 / 修改密码 */
(function () {
    'use strict';

    MR.UserApi = {
        me() {
            return MR.Request.get('/users/me');
        },

        updateMe(payload) {
            return MR.Request.put('/users/me', payload);
        },

        changePassword(oldPassword, newPassword) {
            return MR.Request.put('/users/me/password', { oldPassword, newPassword });
        },
    };
})();
