/** 我的预约 */
(function () {
    'use strict';

    const state = {
        status: '',
        page: { pageNum: 1, pageSize: 10 },
        total: 0,
        list: [],
    };

    async function load() {
        const params = Object.assign({}, state.page);
        if (state.status !== '') params.status = state.status;
        try {
            const res = await MR.ReservationApi.myPage(params);
            state.list = res.records || [];
            state.total = res.total || 0;
            render();
            renderPager();
        } catch (e) {
            MR.Notify.error('加载失败：' + (e.message || ''));
        }
    }

    function render() {
        const box = document.getElementById('resListBox');
        if (!state.list.length) {
            box.innerHTML = `<div class="state-block">
                <div class="state-block__title">暂无预约记录</div>
                <a class="btn mt-md" href="/pages/reservation/reservation-create.html">立即创建</a>
            </div>`;
            return;
        }
        box.innerHTML = state.list.map(r => `
            <article class="res-card ${cardCls(r.status)}">
                <header class="res-card__header">
                    <div>
                        <div class="res-card__title">${MR.escapeHtml(r.title)}</div>
                        <div class="res-card__meta">
                            <span>🏢 ${MR.escapeHtml(r.roomName || '')} (${MR.escapeHtml(r.roomFloor || '')})</span>
                            <span>🕒 ${MR.formatDate(r.startTime)} ~ ${MR.formatDate(r.endTime, 'HH:mm')}</span>
                            <span>👥 ${r.attendeeCount} 人</span>
                        </div>
                    </div>
                    <span class="tag ${tagOfStatus(r.status)}">${MR.escapeHtml(r.statusDesc)}</span>
                </header>
                ${r.description ? `<div class="res-card__desc">${MR.escapeHtml(r.description)}</div>` : ''}
                ${r.cancelReason ? `<div class="res-card__desc text-danger">取消/驳回原因：${MR.escapeHtml(r.cancelReason)}</div>` : ''}
                <div class="res-card__actions">
                    ${canModify(r.status) ? `<button class="btn btn--small btn--ghost" data-act="edit" data-id="${r.id}">修改</button>` : ''}
                    ${canCancel(r.status) ? `<button class="btn btn--small btn--danger" data-act="cancel" data-id="${r.id}">取消预约</button>` : ''}
                    ${r.status === 1 || r.status === 2 ? `<a class="btn btn--small" href="/pages/meeting/meeting-check-in.html?id=${r.id}">签到/纪要</a>` : ''}
                </div>
            </article>
        `).join('');

        box.addEventListener('click', onAction, { once: true });
    }

    function onAction(e) {
        const t = e.target;
        if (!(t instanceof HTMLElement)) return;
        const act = t.dataset.act;
        const id = t.dataset.id;
        if (!act || !id) return;
        if (act === 'cancel') cancelReservation(Number(id));
        if (act === 'edit')   openEdit(Number(id));
    }

    async function cancelReservation(id) {
        const ok = await MR.Notify.confirm('确定要取消该预约吗？');
        if (!ok) return;
        try {
            await MR.ReservationApi.cancel(id, '用户主动取消');
            MR.Notify.success('已取消');
            load();
        } catch (err) {
            MR.Notify.error(err.message || '取消失败');
        }
    }

    async function openEdit(id) {
        // 拉详情
        let r;
        try { r = await MR.ReservationApi.detail(id); } catch (e) { return MR.Notify.error(e.message); }

        // 拉所有房间
        let rooms = [];
        try { rooms = await MR.RoomApi.listAll(1); } catch (e) {}

        const html = `
            <form class="mr-form" id="editForm">
                <div class="mr-form__row">
                    <label class="mr-form__label">会议室</label>
                    <select class="mr-select" name="roomId">
                        ${rooms.map(rm => `<option value="${rm.id}" ${rm.id === r.roomId ? 'selected' : ''}>${MR.escapeHtml(rm.name)}</option>`).join('')}
                    </select>
                </div>
                <div class="mr-form__row">
                    <label class="mr-form__label">主题</label>
                    <input class="mr-input" type="text" name="title" value="${MR.escapeHtml(r.title)}">
                </div>
                <div class="mr-form__row mr-form__row--inline">
                    <div style="flex:1">
                        <label class="mr-form__label">开始</label>
                        <input class="mr-input" type="datetime-local" name="startTime" value="${toLocal(r.startTime)}">
                    </div>
                    <div style="flex:1">
                        <label class="mr-form__label">结束</label>
                        <input class="mr-input" type="datetime-local" name="endTime" value="${toLocal(r.endTime)}">
                    </div>
                </div>
                <div class="mr-form__row">
                    <label class="mr-form__label">参会人数</label>
                    <input class="mr-input" type="number" name="attendeeCount" value="${r.attendeeCount}" min="1">
                </div>
                <div class="mr-form__row">
                    <label class="mr-form__label">描述</label>
                    <textarea class="mr-textarea" name="description">${MR.escapeHtml(r.description || '')}</textarea>
                </div>
            </form>
        `;

        MR.Modal.open({
            title: '修改预约',
            contentHtml: html,
            width: 560,
            onOk: async (box) => {
                const f = box.querySelector('#editForm');
                const payload = {
                    roomId: Number(f.roomId.value),
                    title: f.title.value.trim(),
                    startTime: f.startTime.value.replace('T', ' ') + ':00',
                    endTime:   f.endTime.value.replace('T', ' ') + ':00',
                    attendeeCount: Number(f.attendeeCount.value),
                    description: f.description.value.trim() || null,
                };
                try {
                    await MR.ReservationApi.update(id, payload);
                    MR.Notify.success('修改成功');
                    load();
                    return true;
                } catch (err) {
                    MR.Notify.error(err.message || '修改失败');
                    return false;
                }
            }
        });
    }

    function toLocal(s) {
        if (!s) return '';
        return String(s).replace(' ', 'T').slice(0, 16);
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

    function canCancel(code) { return code === 0 || code === 1 || code === 2; }
    function canModify(code) { return code === 0 || code === 1; }
    function tagOfStatus(c) {
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
    function cardCls(c) {
        switch (c) {
            case 0: return 'res-card--pending';
            case 3: return 'res-card--completed';
            case 4: return 'res-card--cancelled';
            case 5: return 'res-card--rejected';
            default: return '';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!MR.Auth.requireLogin()) return;
        MR.Header.render('appHeader', { active: 'reservations' });
        bindTabs();
        load();
    });
})();
