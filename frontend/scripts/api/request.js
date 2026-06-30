/**
 * 统一 fetch 封装：MR.Request
 *
 * 职责：
 * - 自动拼接 API_BASE_URL
 * - 自动注入 Authorization 头
 * - 自动 JSON 序列化请求体、解析响应
 * - 自动剥 Result<T> 外壳：成功直接返回 data，失败抛出业务错误
 * - 401 统一跳登录
 * - 提供 GET/POST/PUT/DELETE 简写
 */
(function () {
    'use strict';

    const { API_BASE_URL, AUTH_HEADER, AUTH_PREFIX, REQUEST_TIMEOUT } = MR.Constants;

    /**
     * 拼接 query string
     * @param {Record<string, any>} [params]
     */
    function buildQuery(params) {
        if (!params || typeof params !== 'object') return '';
        const parts = [];
        Object.keys(params).forEach(key => {
            const v = params[key];
            if (v === undefined || v === null || v === '') return;
            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(v));
        });
        return parts.length ? ('?' + parts.join('&')) : '';
    }

    /**
     * 核心请求方法。
     *
     * @param {string} path - 相对 API_BASE_URL 的路径，以 / 开头
     * @param {object} [options]
     * @param {string} [options.method='GET']
     * @param {Record<string, any>} [options.params] - URL 参数
     * @param {any} [options.body] - 请求体（自动 JSON）
     * @param {Record<string, string>} [options.headers]
     * @param {number} [options.timeout]
     * @param {boolean} [options.skipAuth=false] - 不注入 Authorization
     * @returns {Promise<any>} 后端 Result.data
     */
    async function request(path, options) {
        const opts = options || {};
        const method = (opts.method || 'GET').toUpperCase();
        const url = API_BASE_URL + path + buildQuery(opts.params);

        const headers = Object.assign(
            { 'Content-Type': 'application/json;charset=UTF-8' },
            opts.headers || {}
        );

        if (!opts.skipAuth) {
            const token = MR.Auth.getToken();
            if (token) headers[AUTH_HEADER] = AUTH_PREFIX + token;
        }

        const init = { method, headers };
        if (opts.body !== undefined && method !== 'GET' && method !== 'HEAD') {
            init.body = typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body);
        }

        // 超时控制
        const controller = new AbortController();
        const timeout = opts.timeout || REQUEST_TIMEOUT;
        const timer = setTimeout(() => controller.abort(), timeout);
        init.signal = controller.signal;

        let resp;
        try {
            resp = await fetch(url, init);
        } catch (e) {
            clearTimeout(timer);
            if (e.name === 'AbortError') {
                throw new RequestError(-1, '请求超时，请稍后重试');
            }
            throw new RequestError(-1, '网络异常，请检查后端是否启动');
        }
        clearTimeout(timer);

        // HTTP 层错误
        if (resp.status === 401) {
            MR.Auth.logout();
            MR.Auth.redirectToLogin();
            throw new RequestError(401, '未登录或登录已过期');
        }

        let payload;
        try {
            payload = await resp.json();
        } catch (e) {
            throw new RequestError(resp.status, 'HTTP ' + resp.status + ' 响应不是合法 JSON');
        }

        // 业务层校验：剥 Result 外壳
        if (payload && typeof payload === 'object' && 'code' in payload) {
            if (payload.code === 0) {
                return payload.data;
            }
            throw new RequestError(payload.code, payload.message || '请求失败');
        }

        // 非 Result 结构直接返回
        return payload;
    }

    /** 自定义错误，业务层 try/catch 可识别 */
    class RequestError extends Error {
        constructor(code, message) {
            super(message);
            this.name = 'RequestError';
            this.code = code;
        }
    }

    MR.Request = {
        request,
        get:  (path, params, opts) => request(path, Object.assign({ method: 'GET',    params }, opts)),
        post: (path, body,   opts) => request(path, Object.assign({ method: 'POST',   body   }, opts)),
        put:  (path, body,   opts) => request(path, Object.assign({ method: 'PUT',    body   }, opts)),
        del:  (path, params, opts) => request(path, Object.assign({ method: 'DELETE', params }, opts)),
        RequestError,
    };
})();
