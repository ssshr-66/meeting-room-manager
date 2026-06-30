/** 管理员 - 审批 */
(function () {
    'use strict';

    const state = {
        status: '0',
        page: { pageNum: 1, pageSize: 10 },
        total: 0,
        list: [],
    };

    async function load() {
        const params = Object.assign({}, state.page);
        if (state.status !== '') params.status = state.status;
        try {
            const res = await MR.ApprovalApi.page(params);
            state.list = res.records || [];
            state.total = res.total || 0;
            render();
            renderPager();
        } catch (e) {
            MR.Notify.error('加载失败：' + (e.message || ''));
        }
    }

    function render() {
        const box = document.getElementById('approvalListBox');
        if (!state.list.length) {
            box.innerHTML = '<div class="state-block"><div class="state-block__title">暂无审批数据</div></div>';
            return;
        }
        box.innerHTML = state.list.map(a => {
            const r = a.reservation || {};
            return `
                <article class="res-card ${a.status === 0 ? 'res-card--pending' : ''}" data-id="${a.id}">
                    <header class="res-card__header">
                        <div>
                            <div class="res-card__title">${MR.escapeHtml(r.title || '—')}</div>
                            <div class="res-card__meta">
                                <span>🏢 ${MR.escapeHtml(r.roomName || '')}</span>
                                <span>👤 ${MR.escapeHtml(r.userNickname || '')} (${MR.escapeHtml(r.userEmployeeNo || '')})</span>
                                <span>🕒 ${MR.formatDate(r.startTime)} ~ ${MR.formatDate(r.endTime, 'HH:mm')}</span>
                                <span>👥 ${r.attendeeCount}</span>
                            </div>
                        </div>
                        <span class="tag ${a.status === 0 ? 'tag--warn' : a.status === 1 ? 'tag--success' : 'tag--danger'}">${MR.escapeHtml(a.statusDesc)}</span>
                    </header>
                    ${r.description ? `<div class="res-card__desc">${MR.escapeHtml(r.description)}</div>` : ''}
                    ${a.rejectReason ? `<div class="res-card__desc text-danger">驳回原因：${MR.escapeHtml(a.rejectReason)}</div>` : ''}
                    ${a.approverNickname ? `<div class="res-card__desc text-tertiary">审批人：${MR.escapeHtml(a.approverNickname)} · ${MR.formatDate(a.approvedAt)}</div>` : ''}
                    ${a.status === 0 ? `
                        <div class="res-card__actions">
                            <button class="btn btn--small btn--danger" data-act="reject">驳回</button>
                            <button class="btn btn--small btn--success" data-act="approve">通过</button>
                        </div>` : ''}
                </article>
            `;
        }).join('');

        box.addEventListener('click', onAction, { once: true });
    }

    function onAction(e) {
        const t = e.target;
        if (!(t instanceof HTMLElement) || !t.dataset.act) return;
        const card = t.closest('[data-id]');
        const id = Number(card.dataset.id);
        if (t.dataset.act === 'approve') doAction(id, 1);
        else if (t.dataset.act === 'reject') openReject(id);
    }

    async function doAction(id, status, rejectReason) {
        try {
            await MR.ApprovalApi.action(id, status, rejectReason || null);
            MR.Notify.success(status === 1 ? '已通过' : '已驳回');
            load();
        } catch (e) {
            MR.Notify.error(e.message || '操作失败');
        }
    }

    function openReject(id) {
        MR.Modal.open({
            title: '驳回理由',
            contentHtml: `
                <form id="rejForm">
                    <textarea class="mr-textarea" id="rejReason" placeholder="请填写驳回原因（必填）" maxlength="255"></textarea>
                </form>
            `,
            width: 480,
            okText: '驳回',
            onOk: async (box) => {
                const v = box.querySelector('#rejReason').value.trim();
                if (!v) { MR.Notify.warn('请填写驳回原因'); return false; }
                await doAction(id, 2, v);
                return true;
            }
        });
    }

    function renderPager() {
        MR.Pagination.render('pagerBox', {
            total: state.total,
            pageNum: state.page.pageNum,
            pageSize: state.page.pageSize,
            onChange: (n) => { state.page.pageNum = n; load(); },
        });
    }

    function bindTabs() {
        document.getElementById('statusTabs').addEventListener('click', (e) => {
            if (!(e.target instanceof HTMLButtonElement)) return;
            document.querySelectorAll('.status-tab').forEach(b => b.classList.remove('is-active'));
            e.target.classList.add('is-active');
            state.status = e.target.dataset.status;
            state.page.pageNum = 1;
            load();
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!MR.Auth.requireLogin()) return;
        if (!MR.Auth.isAdmin()) {
            MR.Notify.warn('需要管理员权限');
            setTimeout(() => location.href = '/', 800);
            return;
        }
        MR.Header.render('appHeader', { active: 'admin-approval', adminMode: true });
        bindTabs();
        load();
    });
})();
