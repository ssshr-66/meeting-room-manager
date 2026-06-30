/**
 * 通知 / 提示组件：toast / confirm。
 *
 * 用法：
 *   MR.Notify.success('保存成功');
 *   MR.Notify.error('网络异常');
 *   MR.Notify.warn('确认提示');
 *   MR.Notify.confirm('确定要取消该预约吗？').then(ok => { if (ok) ... });
 */
(function () {
    'use strict';

    function ensureContainer() {
        let c = document.getElementById('mrToastContainer');
        if (!c) {
            c = document.createElement('div');
            c.id = 'mrToastContainer';
            c.className = 'mr-toast-container';
            document.body.appendChild(c);
        }
        return c;
    }

    function toast(message, type, duration) {
        const c = ensureContainer();
        const el = document.createElement('div');
        el.className = 'mr-toast mr-toast--' + (type || 'info');
        el.textContent = String(message);
        c.appendChild(el);
        // 触发动画
        requestAnimationFrame(() => el.classList.add('mr-toast--show'));
        setTimeout(() => {
            el.classList.remove('mr-toast--show');
            setTimeout(() => el.remove(), 300);
        }, duration || 2500);
    }

    function confirmBox(message, opts) {
        return new Promise((resolve) => {
            const options = opts || {};
            const mask = document.createElement('div');
            mask.className = 'mr-confirm__mask';
            const box = document.createElement('div');
            box.className = 'mr-confirm__box';
            box.innerHTML = `
                <div class="mr-confirm__title">${MR.escapeHtml(options.title || '提示')}</div>
                <div class="mr-confirm__body">${MR.escapeHtml(message)}</div>
                <div class="mr-confirm__actions">
                    <button class="btn btn--ghost" data-act="cancel">${MR.escapeHtml(options.cancelText || '取消')}</button>
                    <button class="btn" data-act="ok">${MR.escapeHtml(options.okText || '确定')}</button>
                </div>
            `;
            mask.appendChild(box);
            document.body.appendChild(mask);

            const close = (ok) => {
                mask.remove();
                resolve(ok);
            };
            box.addEventListener('click', (e) => {
                const t = e.target;
                if (t && t.dataset && t.dataset.act === 'ok') close(true);
                else if (t && t.dataset && t.dataset.act === 'cancel') close(false);
            });
            mask.addEventListener('click', (e) => { if (e.target === mask) close(false); });
        });
    }

    MR.Notify = {
        success: (m, d) => toast(m, 'success', d),
        error:   (m, d) => toast(m, 'error', d || 3500),
        warn:    (m, d) => toast(m, 'warn', d),
        info:    (m, d) => toast(m, 'info', d),
        confirm: confirmBox,
    };
})();
