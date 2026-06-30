/**
 * 全局常量与命名空间初始化。
 * 必须最先加载（在 storage / auth / request 之前）。
 *
 * 命名空间约定见 .trellis/spec/frontend/index.md
 */
(function () {
    'use strict';

    // 初始化全局命名空间
    window.MR = window.MR || {};

    /** 业务常量 */
    MR.Constants = Object.freeze({
        /** 后端 API 根地址 */
        API_BASE_URL: 'http://localhost:8080/api/v1',

        /** localStorage Key 统一前缀 */
        STORAGE_PREFIX: 'mr:',

        /** Token 存储 Key（不含前缀，Storage 自动拼） */
        TOKEN_KEY: 'token',

        /** 用户信息存储 Key */
        USER_KEY: 'user',

        /** HTTP Header 名 */
        AUTH_HEADER: 'Authorization',
        AUTH_PREFIX: 'Bearer ',

        /** 默认请求超时 (ms) */
        REQUEST_TIMEOUT: 10000,
    });

    /** 业务枚举（占位，后续按需扩充） */
    MR.Enums = Object.freeze({
        /** 用户角色 */
        UserRole: Object.freeze({ USER: 'USER', ADMIN: 'ADMIN' }),
    });

})();
