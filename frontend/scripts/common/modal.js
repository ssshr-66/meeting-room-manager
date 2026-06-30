/**
 * 通用 Modal：传入标题 + body HTML + 按钮回调。
 *
 * 用法：
 *   const modal = MR.Modal.open({
 *       title: '编辑',
 *       contentHtml: '<form id="f">...</form>',
 *       width: 480,
 *       onOk: () => { ... return true; }    // return false 阻止关闭
 *   });
 *   modal.close();
 */
(function () {
    'use strict';

    function open(opts) {
        const o = opts || {};
        const mask = document.createElement('div');
        mask.className = 'mr-modal__mask';

        const box = document.createElement('div');
        box.className = 'mr-modal__box';
        if (o.width) box.style.width = (typeof o.width === 'number' ? o.width + 'px' : o.width);

        box.innerHTML = `
            <header class="mr-modal__header">
                <span class="mr-modal__title">${MR.escapeHtml(o.title || '')}</span>
                <button class="mr-modal__close" aria-label="close" data-act="close">×</button>
            </header>
            <section class="mr-modal__body">${o.contentHtml || ''}</section>
            <footer class="mr-modal__footer">
                <button class="btn btn--ghost" data-act="cancel">${MR.escapeHtml(o.cancelText || '取消')}</button>
                <button class="btn" data-act="ok">${MR.escapeHtml(o.okText || '确定')}</button>
            </footer>
        `;
        mask.appendChild(box);
        document.body.appendChild(mask);

        const close = () => {
            mask.remove();
            if (typeof o.onClose === 'function') o.onClose();
        };

        box.addEventListener('click', async (e) => {
            const act = e.target && e.target.dataset && e.target.dataset.act;
            if (act === 'close' || act === 'cancel') {
                close();
            } else if (act === 'ok') {
                if (typeof o.onOk === 'function') {
                    const r = await o.onOk(box);
                    if (r === false) return; // 阻止关闭
                }
                close();
            }
        });

        if (o.onOpen) o.onOpen(box);

        return { box, close };
    }

    MR.Modal = { open };
})();
