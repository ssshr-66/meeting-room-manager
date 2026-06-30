/**
 * 系统级 API：健康检查、服务信息。
 */
(function () {
    'use strict';

    MR.SystemApi = {
        /** 健康检查 → "pong" */
        ping() {
            return MR.Request.get('/ping', null, { skipAuth: true });
        },

        /** 服务基本信息 */
        info() {
            return MR.Request.get('/system/info', null, { skipAuth: true });
        },
    };
})();
