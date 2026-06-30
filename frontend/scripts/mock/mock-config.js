/**
 * Mock 开关与配置。
 *
 * 关闭 mock：将 enabled 改为 false，或在浏览器控制台执行：
 *   MR.Mock.enabled = false
 *   location.reload();
 *
 * 数据重置：MR.Mock.reset()
 */
(function () {
    'use strict';

    window.MR = window.MR || {};
    MR.Mock = MR.Mock || {};

    Object.assign(MR.Mock, {
        /** 是否启用 mock（默认开） */
        enabled: true,

        /** 模拟接口延迟 (ms)，0 = 立即返回；建议 80~200 ms，更接近真实体验 */
        delay: 120,

        /** 是否在控制台打印 mock 请求日志 */
        log: true,

        /** 已注册的 handler 路由表（由 mock-router 填充） */
        routes: [],

        /** handler 在加载时调用，把自己挂到 routes */
        register(method, pattern, handler) {
            this.routes.push({ method: method.toUpperCase(), pattern, handler });
        },

        /** 重置内存数据为初始种子（页面无需刷新） */
        reset() {
            if (typeof MR.MockData.__reset === 'function') {
                MR.MockData.__reset();
                console.info('[Mock] 数据已重置为初始种子');
            }
        },
    });
})();
