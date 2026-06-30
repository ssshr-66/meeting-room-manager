/** 管理员 - 公告管理 */
(function () {
    'use strict';

    const state = {
        page: { pageNum: 1, pageSize: 10 },
        filter: { keyword: '', type: '', status: '' },
        total: 0,
        list: [],
    };

    async function load() {
        const params = Object.assign({}, state.page);
        Object.keys(state.filter).forEach(k => {
            if (state.filter[k] !== '' && state.filter[k] != null) params[k] = state.filter[k];
        });
        try {
            const res = await MR.NoticeApi.adminPage(params);
            state.list = res.records || [];
            state.total = res.total || 0;
            render();
            renderPager();
        } catch (e) {
            MR.Notify.error('加载失败：' + (e.message || ''));
        }
    }

    function render() {
        const tbody = document.getElementById('noticeTbody');
        if (!state.list.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="mr-table__empty">暂无公告</td></tr>';
            return;
        }
        tbody.innerHTML = state.list.map(n => `
            <tr data-id="${n.id}">
                <td><strong>${MR.escapeHtml(n.title)}</strong></td>
                <td><span class="tag ${n.type === 2 ? 'tag--warn' : 'tag--info'}">${MR.escapeHtml(n.typeDesc)}</span></td>
                <td><span class="tag ${n.priority === 2 ? 'tag--danger' : n.priority === 1 ? 'tag--warn' : 'tag--default'}">${MR.escapeHtml(n.priorityDesc)}</span></td>
                <td>${MR.escapeHtml(n.publisherNickname || '')}</td>
                <td>${MR.formatDate(n.publishAt) || '—'}</td>
                <td><span class="tag ${n.status === 1 ? 'tag--success' : 'tag--default'}">${MR.escapeHtml(n.statusDesc)}</span></td>
                <td>
                    <button class="btn btn--small btn--ghost" data-act="edit">编辑</button>
                    <button class="btn btn--small btn--danger" data-act="del">删除</button>
                </td>
            </tr>
        `).join('');
        tbody.addEventListener('click', onAction, { once: true });
    }

    function onAction(e) {
        const t = e.target;
        if (!(t instanceof HTMLElement) || !t.dataset.act) return;
        const id = Number(t.closest('tr').dataset.id);
        if (t.dataset.act === 'edit') openForm(id);
        else if (t.dataset.act === 'del') doDelete(id);
    }

    function openForm(id) {
        const n = id ? state.list.find(x => x.id === id) : null;
        const isEdit = !!n;
        const html = `
            <form class="mr-form" id="noticeForm">
                <div class="mr-form__row">
                    <label class="mr-form__label mr-form__label--required">标题</label>
                    <input class="mr-input" name="title" value="${n ? MR.escapeHtml(n.title) : ''}" maxlength="128">
                </div>
                <div class="mr-form__row mr-form__row--inline">
                    <div style="flex:1">
                        <label class="mr-form__label">类型</label>
                        <select class="mr-select" name="type">
                            <option value="1" ${!n || n.type === 1 ? 'selected' : ''}>系统公告</option>
                            <option value="2" ${n && n.type === 2 ? 'selected' : ''}>维护通知</option>
                        </select>
                    </div>
                    <div style="flex:1">
                        <label class="mr-form__label">优先级</label>
                        <select class="mr-select" name="priority">
                            <option value="0" ${!n || n.priority === 0 ? 'selected' : ''}>普通</option>
                            <option value="1" ${n && n.priority === 1 ? 'selected' : ''}>重要</option>
                            <option value="2" ${n && n.priority === 2 ? 'selected' : ''}>紧急</option>
                        </select>
                    </div>
                    <div style="flex:1">
                        <label class="mr-form__label">状态</label>
                        <select class="mr-select" name="status">
                            <option value="1" ${!n || n.status === 1 ? 'selected' : ''}>已发布</option>
                            <option value="0" ${n && n.status === 0 ? 'selected' : ''}>已下架</option>
                        </select>
                    </div>
                </div>
                <div class="mr-form__row">
                    <label class="mr-form__label mr-form__label--required">内容</label>
                    <textarea class="mr-textarea" name="content" rows="8" maxlength="5000">${n ? MR.escapeHtml(n.content) : ''}</textarea>
                </div>
            </form>
        `;
        MR.Modal.open({
            title: isEdit ? '编辑公告' : '发布公告',
            contentHtml: html,
            width: 640,
            onOk: async (box) => {
                const f = box.querySelector('#noticeForm');
                const payload = {
                    title: f.title.value.trim(),
                    content: f.content.value.trim(),
                    type: Number(f.type.value),
                    priority: Number(f.priority.value),
                    status: Number(f.status.value),
                };
                if (!payload.title || !payload.content) {
                    MR.Notify.warn('请填写标题和内容');
                    return false;
                }
                try {
                    if (isEdit) await MR.NoticeApi.update(id, payload);
                    else        await MR.NoticeApi.create(payload);
                    MR.Notify.success(isEdit ? '已更新' : '已发布');
                    load();
                    return true;
                } catch (err) {
                    MR.Notify.error(err.message || '失败');
                    return false;
                }
            }
        });
    }

    async function doDelete(id) {
        const ok = await MR.Notify.confirm('确认删除该公告？');
        if (!ok) return;
        try {
            await MR.NoticeApi.remove(id);
            MR.Notify.success('已删除');
            load();
        } catch (e) {
            MR.Notify.error(e.message || '失败');
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
        MR.Header.render('appHeader', { active: 'admin-notice', adminMode: true });
        document.getElementById('addBtn').addEventListener('click', () => openForm(null));
        const apply = MR.debounce(() => { state.page.pageNum = 1; load(); }, 300);
        document.getElementById('kwInput').addEventListener('input', (e) => { state.filter.keyword = e.target.value.trim(); apply(); });
        document.getElementById('typeSel').addEventListener('change', (e) => { state.filter.type = e.target.value; state.page.pageNum = 1; load(); });
        document.getElementById('statusSel').addEventListener('change', (e) => { state.filter.status = e.target.value; state.page.pageNum = 1; load(); });
        document.getElementById('resetBtn').addEventListener('click', () => {
            state.filter = { keyword: '', type: '', status: '' };
            ['kwInput','typeSel','statusSel'].forEach(id => { document.getElementById(id).value = ''; });
            state.page.pageNum = 1; load();
        });
        load();
    });
})();
