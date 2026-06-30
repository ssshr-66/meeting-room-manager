/**
 * localStorage / sessionStorage 封装。
 *
 * 所有 key 自动加 MR.Constants.STORAGE_PREFIX 前缀，避免与其他应用冲突；
 * 自动 JSON 序列化 / 反序列化；
 * 提供 Storage 与 Session 两套同构 API。
 */
(function () {
    'use strict';

    const PREFIX = MR.Constants.STORAGE_PREFIX;

    /**
     * @param {Storage} backend - window.localStorage 或 window.sessionStorage
     */
    function build(backend) {
        return {
            /** 写入 */
            set(key, value) {
                try {
                    backend.setItem(PREFIX + key, JSON.stringify(value));
                } catch (e) {
                    console.warn('[MR.Storage] set 失败', key, e);
                }
            },

            /** 读取（带默认值） */
            get(key, defaultValue) {
                try {
                    const raw = backend.getItem(PREFIX + key);
                    if (raw === null || raw === undefined) {
                        return defaultValue !== undefined ? defaultValue : null;
                    }
                    return JSON.parse(raw);
                } catch (e) {
                    console.warn('[MR.Storage] get 失败', key, e);
                    return defaultValue !== undefined ? defaultValue : null;
                }
            },

            /** 删除 */
            remove(key) {
                backend.removeItem(PREFIX + key);
            },

            /** 清空当前应用前缀下所有 key */
            clear() {
                const keys = [];
                for (let i = 0; i < backend.length; i++) {
                    const k = backend.key(i);
                    if (k && k.startsWith(PREFIX)) keys.push(k);
                }
                keys.forEach(k => backend.removeItem(k));
            },
        };
    }

    MR.Storage = build(window.localStorage);
    MR.Session = build(window.sessionStorage);
})();
