/**
 * 通用分页组件。
 *
 * 用法：
 *   <div id="pagerBox"></div>
 *   MR.Pagination.render('pagerBox', {
 *       total: 120, pageNum: 1, pageSize: 20,
 *       onChange: (newPageNum) => { ... reload data ... }
 *   });
 */
(function () {
    'use strict';

    function render(target, opts) {
        const el = typeof target === 'string' ? document.getElementById(target) : target;
        if (!el) return;
        const total    = Number(opts.total || 0);
        const pageSize = Number(opts.pageSize || 20);
        const pageNum  = Number(opts.pageNum || 1);
        const totalPage = Math.max(1, Math.ceil(total / pageSize));
        const onChange = opts.onChange || function () {};

        el.className = 'mr-pagination';
        if (total === 0) {
            el.innerHTML = '';
            return;
        }

        el.innerHTML = `
            <button class="mr-pagination__btn" data-act="prev" ${pageNum <= 1 ? 'disabled' : ''}>上一页</button>
            <span class="mr-pagination__info">第 ${pageNum} / ${totalPage} 页 · 共 ${total} 条</span>
            <button class="mr-pagination__btn" data-act="next" ${pageNum >= totalPage ? 'disabled' : ''}>下一页</button>
        `;
        el.addEventListener('click', (e) => {
            const t = e.target;
            if (!(t instanceof HTMLElement) || !t.dataset.act) return;
            if (t.dataset.act === 'prev' && pageNum > 1) onChange(pageNum - 1);
            if (t.dataset.act === 'next' && pageNum < totalPage) onChange(pageNum + 1);
        }, { once: true });
    }

    MR.Pagination = { render };
})();
