/**
 * 通用工具：日期 / XSS 转义 / 防抖。
 */
(function () {
    'use strict';

    /** HTML 转义，防止 XSS */
    MR.escapeHtml = function (str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    /**
     * 格式化日期时间。
     * @param {string|Date} dt
     * @param {string} [fmt] - 默认 'yyyy-MM-dd HH:mm'
     */
    MR.formatDate = function (dt, fmt) {
        if (!dt) return '';
        const d = (dt instanceof Date) ? dt : new Date(typeof dt === 'string' ? dt.replace(' ', 'T') : dt);
        if (isNaN(d.getTime())) return String(dt);
        const pad = (n) => String(n).padStart(2, '0');
        const map = {
            yyyy: d.getFullYear(),
            MM: pad(d.getMonth() + 1),
            dd: pad(d.getDate()),
            HH: pad(d.getHours()),
            mm: pad(d.getMinutes()),
            ss: pad(d.getSeconds()),
        };
        return (fmt || 'yyyy-MM-dd HH:mm').replace(/yyyy|MM|dd|HH|mm|ss/g, k => map[k]);
    };

    /** 相对时间（5 分钟前 / 在 30 分钟后） */
    MR.fromNow = function (dt) {
        if (!dt) return '';
        const d = (dt instanceof Date) ? dt : new Date(String(dt).replace(' ', 'T'));
        const diff = (d.getTime() - Date.now()) / 1000;
        const abs = Math.abs(diff);
        const future = diff > 0;
        let val, unit;
        if (abs < 60)        { val = Math.floor(abs); unit = '秒'; }
        else if (abs < 3600) { val = Math.floor(abs / 60); unit = '分钟'; }
        else if (abs < 86400){ val = Math.floor(abs / 3600); unit = '小时'; }
        else                 { val = Math.floor(abs / 86400); unit = '天'; }
        return future ? ('在 ' + val + ' ' + unit + '后') : (val + ' ' + unit + '前');
    };

    MR.debounce = function (fn, wait) {
        let t;
        return function () {
            const args = arguments, ctx = this;
            clearTimeout(t);
            t = setTimeout(() => fn.apply(ctx, args), wait);
        };
    };

    MR.qs = (sel, parent) => (parent || document).querySelector(sel);
    MR.qsa = (sel, parent) => Array.from((parent || document).querySelectorAll(sel));

    /** URL 参数解析 */
    MR.parseQuery = function () {
        const obj = {};
        const search = window.location.search.replace(/^\?/, '');
        if (!search) return obj;
        search.split('&').forEach(pair => {
            const [k, v] = pair.split('=');
            if (k) obj[decodeURIComponent(k)] = decodeURIComponent(v || '');
        });
        return obj;
    };
})();
