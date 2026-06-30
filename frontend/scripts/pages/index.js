/**
 * 首页脚本：调通后端 ping，展示连通性。
 */
(function () {
    'use strict';

    /** 渲染状态行 */
    function setStatus(targetId, ok, text) {
        const el = document.getElementById(targetId);
        if (!el) return;
        el.textContent = text;
        el.className = ok
            ? 'status-block__value status-block__value--ok'
            : 'status-block__value status-block__value--fail';
    }

    async function checkBackend() {
        try {
            const pong = await MR.SystemApi.ping();
            setStatus('pingStatus', true, pong);

            const info = await MR.SystemApi.info();
            setStatus('appName',    true, info.app);
            setStatus('appVersion', true, info.version);
            setStatus('serverTime', true, info.serverTime);
        } catch (e) {
            console.error('[index] 后端探测失败', e);
            setStatus('pingStatus', false, '失败: ' + (e.message || '未知错误'));
        }
    }

    document.addEventListener('DOMContentLoaded', checkBackend);
})();
