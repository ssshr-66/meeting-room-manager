/** 管理员 - 预约记录管理 */
(function () {
    'use strict';

    const state = {
        page: { pageNum: 1, pageSize: 10 },
        filter: { keyword: '', status: '', roomId: '', startDate: '', endDate: '' },
        total: 0,
        list: [],
    };

    async function loadRooms() {
        const sel = document.getElementById('roomSel');
        try {
            const list = await MR.RoomApi.listAll(null);
            sel.innerHTML = '<option value="">所有会议室</option>' +
                list.map(r => `<option value="${r.id}">${MR.escapeHtml(r.name)}</option>`).join('');
        } catch (e) {}
    }

    async function load() {
        const params = Object.assign({}, state.page);
        Object.keys(state.filter).forEach(k => {
            if (state.filter[k]) params[k] = state.filter[k];
        });
        try {
            const res = await MR.AdminApi.reservationPage(params);
            state.list = res.records || [];
            state.total = res.total || 0;
            render();
            renderPager();
        } catch (e) {
            MR.Notify.error('加载失败：' + (e.message || ''));
        }
    }

    function render() {
        const tbody = document.getElementById('resTbody');
        if (!state.list.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="mr-table__empty">暂无数据</td></tr>';
            return;
        }
        tbody.innerHTML = state.list.map(r => `
            <tr data-id="${r.id}">
                <td><strong>${MR.escapeHtml(r.title)}</strong>${r.description ? '<br><span class="text-tertiary" style="font-size:12px">' + MR.escapeHtml((r.description || '').slice(0, 40)) + '</span>' : ''}</td>
                <td>${MR.escapeHtml(r.userNickname || '')}<br><span class="text-tertiary" style="font-size:12px">${MR.escapeHtml(r.userEmployeeNo || '')}</span></td>
                <td>${MR.escapeHtml(r.roomName || '')}</td>
                <td>${MR.formatDate(r.startTime)} ~<br>${MR.formatDate(r.endTime, 'HH:mm')}</td>
                <td>${r.attendeeCount}</td>
                <td><span class="tag ${tagOf(r.status)}">${MR.escapeHtml(r.statusDesc)}</span></td>
                <td>
                    ${canCancel(r.status) ? '<button class="btn btn--small btn--danger" data-act="cancel">强制取消</button>' : '—'}
                </td>
            </tr>
        `).join('');
        tbody.addEventListener('click', onAction, { once: true });
    }

    function tagOf(c) {
        switch (c) {
            case 0: return 'tag--warn';
            case 1: return 'tag--primary';
            case 2: return 'tag--success';
            case 3: return 'tag--default';
            case 4: return 'tag--default';
            case 5: return 'tag--danger';
            default: return 'tag--default';
        }
    }
    function canCancel(c) { return c === 0 || c === 1 || c === 2; }

    function onAction(e) {
        const t = e.target;
        if (!(t instanceof HTMLElement) || t.dataset.act !== 'cancel') return;
        const tr = t.closest('tr');
        const id = Number(tr.dataset.id);
        openCancel(id);
    }

    function openCancel(id) {
        MR.Modal.open({
            title: '强制取消预约',
            contentHtml: `
                <p class="text-secondary mb-md">该操作将直接取消用户的预约，请填写理由：</p>
                <textarea class="mr-textarea" id="cancelReason" placeholder="违规取消原因" maxlength="255"></textarea>
            `,
            okText: '确认取消',
            onOk: async (box) => {
                const reason = box.querySelector('#cancelReason').value.trim() || '违规预约';
                try {
                    await MR.AdminApi.forceCancelReservation(id, reason);
                    MR.Notify.success('已取消');
                    load();
                    return true;
                } catch (err) {
                    MR.Notify.error(err.message || '失败');
                    return false;
                }
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

    function bindFilters() {
        const apply = MR.debounce(() => { state.page.pageNum = 1; load(); }, 300);
        document.getElementById('kwInput').addEventListener('input', (e) => { state.filter.keyword = e.target.value.trim(); apply(); });
        document.getElementById('roomSel').addEventListener('change', (e) => { state.filter.roomId = e.target.value; state.page.pageNum = 1; load(); });
        document.getElementById('statusSel').addEventListener('change', (e) => { state.filter.status = e.target.value; state.page.pageNum = 1; load(); });
        document.getElementById('startDate').addEventListener('change', (e) => { state.filter.startDate = e.target.value; state.page.pageNum = 1; load(); });
        document.getElementById('endDate').addEventListener('change', (e) => { state.filter.endDate = e.target.value; state.page.pageNum = 1; load(); });
        document.getElementById('resetBtn').addEventListener('click', () => {
            state.filter = { keyword: '', status: '', roomId: '', startDate: '', endDate: '' };
            ['kwInput','statusSel','roomSel','startDate','endDate'].forEach(id => { document.getElementById(id).value = ''; });
            state.page.pageNum = 1; load();
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!MR.Auth.requireLogin()) return;
        if (!MR.Auth.isAdmin()) {
            MR.Notify.warn('需要管理员权限');
            setTimeout(() => location.href = '/', 800);
            return;
        }
        MR.Header.render('appHeader', { active: 'admin-res', adminMode: true });
        bindFilters();
        loadRooms();
        load();
    });
})();
