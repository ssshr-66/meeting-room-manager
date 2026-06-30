/** 管理员 - 用户管理 */
(function () {
    'use strict';

    const state = {
        page: { pageNum: 1, pageSize: 10 },
        filter: { keyword: '', role: '', status: '' },
        total: 0,
        list: [],
    };

    async function load() {
        const params = Object.assign({}, state.page);
        Object.keys(state.filter).forEach(k => {
            if (state.filter[k] !== '' && state.filter[k] != null) params[k] = state.filter[k];
        });
        try {
            const res = await MR.AdminApi.userPage(params);
            state.list = res.records || [];
            state.total = res.total || 0;
            render();
            renderPager();
        } catch (e) {
            MR.Notify.error('加载失败：' + (e.message || ''));
        }
    }

    function render() {
        const tbody = document.getElementById('userTbody');
        if (!state.list.length) {
            tbody.innerHTML = '<tr><td colspan="9" class="mr-table__empty">暂无数据</td></tr>';
            return;
        }
        tbody.innerHTML = state.list.map(u => `
            <tr data-id="${u.id}">
                <td><strong>${MR.escapeHtml(u.username)}</strong></td>
                <td>${MR.escapeHtml(u.nickname || '')}</td>
                <td>${MR.escapeHtml(u.employeeNo || '—')}</td>
                <td>${MR.escapeHtml(u.email || '')}</td>
                <td>${MR.escapeHtml(u.department || '—')}</td>
                <td><span class="tag ${u.role === 2 ? 'tag--warn' : 'tag--info'}">${MR.escapeHtml(u.roleDesc || '')}</span></td>
                <td><span class="tag ${u.status === 1 ? 'tag--success' : 'tag--danger'}">${MR.escapeHtml(u.statusDesc || '')}</span></td>
                <td><span class="text-tertiary" style="font-size:12px">${MR.formatDate(u.lastLoginAt) || '从未登录'}</span></td>
                <td>
                    ${u.status === 1
                        ? '<button class="btn btn--small btn--danger" data-act="disable">禁用</button>'
                        : '<button class="btn btn--small btn--success" data-act="enable">启用</button>'}
                </td>
            </tr>
        `).join('');
        tbody.addEventListener('click', onAction, { once: true });
    }

    async function onAction(e) {
        const t = e.target;
        if (!(t instanceof HTMLElement) || !t.dataset.act) return;
        const id = Number(t.closest('tr').dataset.id);
        const target = t.dataset.act === 'enable' ? 1 : 0;
        const msg = target === 0 ? '确认禁用该账号？被禁用后用户将无法登录。' : '确认启用该账号？';
        const ok = await MR.Notify.confirm(msg);
        if (!ok) return;
        try {
            await MR.AdminApi.setUserStatus(id, target);
            MR.Notify.success(target === 1 ? '已启用' : '已禁用');
            load();
        } catch (err) {
            MR.Notify.error(err.message || '操作失败');
        }
    }

    function renderPager() {
        MR.Pagination.render('pagerBox', {
            total: state.total,
            pageNum: state.page.pageNum,
            pageSize: state.page.pageSize,
            onChange: (n) => { state.page.pageNum = n; load(); },
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!MR.Auth.requireLogin()) return;
        if (!MR.Auth.isAdmin()) {
            MR.Notify.warn('需要管理员权限');
            setTimeout(() => location.href = '/', 800);
            return;
        }
        MR.Header.render('appHeader', { active: 'admin-users', adminMode: true });
        const apply = MR.debounce(() => { state.page.pageNum = 1; load(); }, 300);
        document.getElementById('kwInput').addEventListener('input', (e) => { state.filter.keyword = e.target.value.trim(); apply(); });
        document.getElementById('roleSel').addEventListener('change', (e) => { state.filter.role = e.target.value; state.page.pageNum = 1; load(); });
        document.getElementById('statusSel').addEventListener('change', (e) => { state.filter.status = e.target.value; state.page.pageNum = 1; load(); });
        document.getElementById('resetBtn').addEventListener('click', () => {
            state.filter = { keyword: '', role: '', status: '' };
            ['kwInput','roleSel','statusSel'].forEach(id => { document.getElementById(id).value = ''; });
            state.page.pageNum = 1; load();
        });
        load();
    });
})();
