/** 公告接口 */
(function () {
    'use strict';

    MR.NoticeApi = {
        /** 首页公告（不需登录） */
        publicLatest(limit) {
            return MR.Request.get('/notices/public/latest', { limit: limit || 5 }, { skipAuth: true });
        },

        page(params) {
            return MR.Request.get('/notices', params);
        },

        detail(id) {
            return MR.Request.get('/notices/' + id);
        },

        /* admin */
        adminPage(params) {
            return MR.Request.get('/admin/notices', params);
        },

        create(payload) {
            return MR.Request.post('/admin/notices', payload);
        },

        update(id, payload) {
            return MR.Request.put('/admin/notices/' + id, payload);
        },

        remove(id) {
            return MR.Request.del('/admin/notices/' + id);
        },
    };
})();
