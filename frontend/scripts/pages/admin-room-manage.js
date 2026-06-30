/** 管理员 - 会议室管理 */
(function () {
    'use strict';

    const state = {
        page: { pageNum: 1, pageSize: 10 },
        filter: { keyword: '', status: '' },
        total: 0,
        list: [],
    };

    async function load() {
        const params = Object.assign({}, state.filter, state.page);
        if (params.status === '') delete params.status;
        try {
            const res = await MR.RoomApi.page(params);
            state.list = res.records || [];
            state.total = res.total || 0;
            render();
            renderPager();
        } catch (e) {
            MR.Notify.error('加载失败：' + (e.message || ''));
        }
    }

    function render() {
        const tbody = document.getElementById('roomTbody');
        if (!state.list.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="mr-table__empty">暂无数据</td></tr>';
            return;
        }
        tbody.innerHTML = state.list.map(r => `
            <tr>
                <td><strong>${MR.escapeHtml(r.name)}</strong></td>
                <td>${MR.escapeHtml(r.floor)} ${r.location ? '<br><span class="text-tertiary">' + MR.escapeHtml(r.location) + '</span>' : ''}</td>
                <td>${r.capacity} 人</td>
                <td>${(r.equipmentList || []).map(e => `<span class="tag tag--info">${MR.escapeHtml(e)}</span>`).join(' ') || '—'}</td>
                <td>${r.needApproval ? '<span class="tag tag--warn">是</span>' : '<span class="tag tag--success">否</span>'}</td>
                <td>${statusTag(r.status, r.statusDesc)}</td>
                <td>
                    <button class="btn btn--small btn--ghost" data-act="edit" data-id="${r.id}">编辑</button>
                    <button class="btn btn--small btn--danger" data-act="del" data-id="${r.id}">删除</button>
                </td>
            </tr>
        `).join('');
        tbody.addEventListener('click', onAction, { once: true });
    }

    function statusTag(code, desc) {
        const cls = code === 1 ? 'tag--success' : code === 2 ? 'tag--warn' : 'tag--default';
        return `<span class="tag ${cls}">${MR.escapeHtml(desc || '')}</span>`;
    }

    function onAction(e) {
        const t = e.target;
        if (!(t instanceof HTMLElement) || !t.dataset.act) return;
        const id = Number(t.dataset.id);
        if (t.dataset.act === 'edit') openForm(id);
        else if (t.dataset.act === 'del') doDelete(id);
    }

    function openForm(id) {
        const r = id ? state.list.find(x => x.id === id) : null;
        const isEdit = !!r;
        const html = `
            <form class="mr-form" id="roomForm">
                <div class="mr-form__row">
                    <label class="mr-form__label mr-form__label--required">名称</label>
                    <input class="mr-input" name="name" value="${r ? MR.escapeHtml(r.name) : ''}" maxlength="64">
                </div>
                <div class="mr-form__row mr-form__row--inline">
                    <div style="flex:1">
                        <label class="mr-form__label mr-form__label--required">楼层</label>
                        <input class="mr-input" name="floor" value="${r ? MR.escapeHtml(r.floor) : ''}" placeholder="如 3F">
                    </div>
                    <div style="flex:1">
                        <label class="mr-form__label">位置</label>
                        <input class="mr-input" name="location" value="${r ? MR.escapeHtml(r.location || '') : ''}" placeholder="如 3F-301">
                    </div>
                </div>
                <div class="mr-form__row mr-form__row--inline">
                    <div style="flex:1">
                        <label class="mr-form__label mr-form__label--required">容纳人数</label>
                        <input class="mr-input" type="number" name="capacity" value="${r ? r.capacity : 10}" min="1" max="500">
                    </div>
                    <div style="flex:1">
                        <label class="mr-form__label">状态</label>
                        <select class="mr-select" name="status">
                            <option value="1" ${!r || r.status === 1 ? 'selected' : ''}>可用</option>
                            <option value="0" ${r && r.status === 0 ? 'selected' : ''}>停用</option>
                            <option value="2" ${r && r.status === 2 ? 'selected' : ''}>维护中</option>
                        </select>
                    </div>
                </div>
                <div class="mr-form__row">
                    <label class="mr-form__label">设备列表（逗号分隔）</label>
                    <input class="mr-input" name="equipment" value="${r ? MR.escapeHtml(r.equipment || '') : ''}" placeholder="投影仪,视频会议,白板">
                </div>
                <div class="mr-form__row">
                    <label class="mr-form__label">封面图 URL</label>
                    <input class="mr-input" name="coverImage" value="${r ? MR.escapeHtml(r.coverImage || '') : ''}">
                </div>
                <div class="mr-form__row">
                    <label class="mr-form__label">描述</label>
                    <textarea class="mr-textarea" name="description">${r ? MR.escapeHtml(r.description || '') : ''}</textarea>
                </div>
                <div class="mr-form__row">
                    <label><input type="checkbox" name="needApproval" ${r && r.needApproval ? 'checked' : ''}> 该会议室需要审批后才能预约</label>
                </div>
            </form>
        `;

        MR.Modal.open({
            title: isEdit ? '编辑会议室' : '新增会议室',
            contentHtml: html,
            width: 560,
            onOk: async (box) => {
                const f = box.querySelector('#roomForm');
                const payload = {
                    name: f.name.value.trim(),
                    floor: f.floor.value.trim(),
                    location: f.location.value.trim() || null,
                    capacity: Number(f.capacity.value),
                    equipment: f.equipment.value.trim() || null,
                    description: f.description.value.trim() || null,
                    coverImage: f.coverImage.value.trim() || null,
                    needApproval: f.needApproval.checked ? 1 : 0,
                    status: Number(f.status.value),
                };
                if (!payload.name)  return MR.Notify.warn('请填写名称') || false;
                if (!payload.floor) return MR.Notify.warn('请填写楼层') || false;
                try {
                    if (isEdit) await MR.AdminApi.updateRoom(id, payload);
                    else        await MR.AdminApi.createRoom(payload);
                    MR.Notify.success(isEdit ? '已更新' : '已创建');
                    load();
                    return true;
                } catch (err) {
                    MR.Notify.error(err.message || '保存失败');
                    return false;
                }
            }
        });
    }

    async function doDelete(id) {
        const ok = await MR.Notify.confirm('确认删除该会议室？');
        if (!ok) return;
        try {
            await MR.AdminApi.deleteRoom(id);
            MR.Notify.success('已删除');
            load();
        } catch (e) {
            MR.Notify.error(e.message || '删除失败');
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
        MR.Header.render('appHeader', { active: 'admin-rooms', adminMode: true });

        document.getElementById('addBtn').addEventListener('click', () => openForm(null));
        const apply = MR.debounce(() => { state.page.pageNum = 1; load(); }, 300);
        document.getElementById('kwInput').addEventListener('input', (e) => { state.filter.keyword = e.target.value.trim(); apply(); });
        document.getElementById('statusSel').addEventListener('change', (e) => { state.filter.status = e.target.value; state.page.pageNum = 1; load(); });
        document.getElementById('resetBtn').addEventListener('click', () => {
            state.filter = { keyword: '', status: '' };
            document.getElementById('kwInput').value = '';
            document.getElementById('statusSel').value = '';
            state.page.pageNum = 1; load();
        });
        load();
    });
})();
