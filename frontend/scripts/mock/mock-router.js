/**
 * Mock 路由：拦截 MR.Request.request，按 path + method 分发到注册的 handler。
 *
 * 加载时机：mock-config / mock-data / mock-helpers / handlers/*.js 加载完毕后再加载本文件，
 * 由本文件 monkey-patch MR.Request.request。
 *
 * Handler 签名：
 *   handler({ method, path, params, body, headers, pathParams, currentUser })
 *     -> 同步/异步返回 data（被自动包装为 Result.ok）
 *     -> 或 throw MockHelpers.bizError(code, message)
 *
 * 未命中 mock 路由的请求会透传到原始 fetch 实现，便于「混用 mock + 真实接口」。
 */
(function () {
    'use strict';

    const H = MR.MockHelpers;

    function init() {
        if (!MR.Mock || !MR.Request) {
            console.warn('[Mock] 未初始化（MR.Mock / MR.Request 缺失），跳过');
            return;
        }
        const originalRequest = MR.Request.request;

        // 编译所有已注册路由的 path pattern
        // 排序：静态段（不含 :param）多的优先；总长度长的优先；
        // 避免 `/reservations/:id` 误匹中 `/reservations/my` 这类问题。
        const compiled = MR.Mock.routes.map(r => {
            const segs = r.pattern.split('/').filter(Boolean);
            const dyn = segs.filter(s => s.startsWith(':')).length;
            const stat = segs.length - dyn;
            return Object.assign({}, r, {
                compiled: H.compilePattern(r.pattern),
                _staticSegs: stat,
                _dynamicSegs: dyn,
                _len: r.pattern.length,
            });
        }).sort((a, b) => {
            if (b._staticSegs !== a._staticSegs) return b._staticSegs - a._staticSegs; // 静态段多的优先
            if (a._dynamicSegs !== b._dynamicSegs) return a._dynamicSegs - b._dynamicSegs; // 动态段少的优先
            return b._len - a._len; // 路径长的优先
        });

        MR.Request.request = async function (path, options) {
            if (!MR.Mock.enabled) {
                return originalRequest.call(this, path, options);
            }
            const opts = options || {};
            const method = (opts.method || 'GET').toUpperCase();

            // 在 mock 路由表中查找
            const matched = findRoute(compiled, method, path);
            if (!matched) {
                if (MR.Mock.log) console.warn('[Mock] miss → fallback', method, path);
                return originalRequest.call(this, path, options);
            }

            // 模拟网络延迟
            if (MR.Mock.delay > 0) await sleep(MR.Mock.delay);

            // 解析当前用户（从 Authorization 头中的伪 JWT）
            const currentUser = resolveCurrentUser(opts);

            // 路径参数 / 查询参数 / body
            const ctx = {
                method, path,
                pathParams: matched.pathParams,
                params: opts.params || {},
                body: opts.body || null,
                headers: opts.headers || {},
                currentUser,
            };

            if (MR.Mock.log) {
                const summary = {
                    pathParams: ctx.pathParams,
                    params: ctx.params,
                    body: ctx.body,
                    user: currentUser ? currentUser.username : null,
                };
                console.info('%c[Mock] hit', 'color:#4f6df5;font-weight:bold',
                    method, path, summary);
            }

            try {
                const data = await matched.route.handler(ctx);
                // 写操作后自动持久化（GET 不持久化以节省 IO）
                if (method !== 'GET' && typeof MR.MockData.__save === 'function') {
                    MR.MockData.__save();
                }
                return data;
            } catch (e) {
                if (e && e.name === 'RequestError') throw e;
                // 把非业务异常透传成系统错误
                console.error('[Mock] handler error', e);
                throw H.bizError(1500, e.message || '系统错误');
            }
        };

        console.info('%c[Mock] 已启用，共 ' + compiled.length + ' 条路由。关闭：MR.Mock.enabled=false',
            'color:#2bb673;font-weight:bold');
    }

    function findRoute(compiled, method, fullPath) {
        // 剥 query string
        const pathOnly = String(fullPath).split('?')[0];
        for (const r of compiled) {
            if (r.method !== method) continue;
            const m = H.matchPath(pathOnly, r.compiled);
            if (m) return { route: r, pathParams: m };
        }
        return null;
    }

    function resolveCurrentUser(opts) {
        const headers = opts && opts.headers ? opts.headers : {};
        let token = headers[MR.Constants.AUTH_HEADER];
        if (!token) {
            // 也尝试从 MR.Auth 取（业务调用前自动注入了 Authorization 头；这里兜底）
            const t = MR.Auth.getToken();
            if (t) token = MR.Constants.AUTH_PREFIX + t;
        }
        if (!token) return null;
        const raw = String(token).replace(MR.Constants.AUTH_PREFIX, '');
        const payload = H.parseFakeToken(raw);
        if (!payload || !payload.uid) return null;
        const u = MR.MockData.users.find(x => x.id === payload.uid);
        return u || null;
    }

    function sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    /* 立即初始化：mock-config / data / helpers / handlers / router 均通过 defer 串行加载，
     * 当 mock-router.js 执行时，前置所有路由已注册完毕，MR.Request 也已暴露。
     * 这样 patch 完成时机一定早于业务页面的 DOMContentLoaded 回调，避免竞态。 */
    init();
})();
