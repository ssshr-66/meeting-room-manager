/** 会议室详情 */
(function () {
    'use strict';

    const state = {
        room: null,
        date: new Date().toISOString().slice(0, 10),
    };

    async function load() {
        const id = MR.parseQuery().id;
        if (!id) {
            renderError('缺少会议室 ID');
            return;
        }
        try {
            state.room = await MR.RoomApi.detail(id);
            await loadSchedule();
        } catch (e) {
            renderError('加载失败：' + (e.message || ''));
        }
    }

    async function loadSchedule() {
        const sch = await MR.RoomApi.schedule(state.room.id, state.date).catch(() => ({ slots: [] }));
        render(sch);
    }

    function renderError(msg) {
        document.getElementById('roomDetail').innerHTML =
            `<div class="state-block"><div class="state-block__title">${MR.escapeHtml(msg)}</div></div>`;
    }

    function render(schedule) {
        const r = state.room;
        const equipments = (r.equipmentList || []).map(e =>
            `<span class="tag tag--info">${MR.escapeHtml(e)}</span>`).join(' ') || '<span class="text-tertiary">无</span>';

        const slots = (schedule.slots || []);
        const slotsHtml = slots.length === 0
            ? '<div class="text-tertiary text-center" style="padding:24px">该日暂无预约 ✅</div>'
            : slots.map(s => {
                const cls = s.status === 0 ? 'schedule-item--pending'
                          : s.status === 2 ? 'schedule-item--inProgress' : '';
                return `
                    <div class="schedule-item ${cls}">
                        <div class="schedule-item__time">
                            ${MR.formatDate(s.startTime, 'HH:mm')} - ${MR.formatDate(s.endTime, 'HH:mm')}
                            <span class="tag ${tagOfStatus(s.status)}" style="margin-left:6px">${MR.escapeHtml(s.statusDesc)}</span>
                        </div>
                        <div class="schedule-item__title">${MR.escapeHtml(s.title)}</div>
                        <div class="schedule-item__user">预约人：${MR.escapeHtml(s.userNickname || '—')}</div>
                    </div>`;
            }).join('');

        document.getElementById('roomDetail').innerHTML = `
            <div class="room-info-card">
                <div class="flex-between">
                    <h1 class="room-info-card__name">${MR.escapeHtml(r.name)}</h1>
                    <span class="tag ${tagOfStatus(r.status)}">${MR.escapeHtml(r.statusDesc || '')}</span>
                </div>
                <div class="room-info-card__meta">
                    <span>🏢 ${MR.escapeHtml(r.floor)} ${MR.escapeHtml(r.location || '')}</span>
                    <span>👥 容纳 ${r.capacity} 人</span>
                    ${r.needApproval === 1 ? '<span class="tag tag--warn">需审批</span>' : '<span class="tag tag--success">免审批</span>'}
                </div>
                <p class="text-secondary">${MR.escapeHtml(r.description || '暂无描述')}</p>

                <div class="room-info-card__section">
                    <div class="room-info-card__section-title">设备配置</div>
                    <div class="flex gap-sm" style="flex-wrap:wrap">${equipments}</div>
                </div>

                <div class="room-info-card__section flex-end">
                    <a class="btn" href="/pages/reservation/reservation-create.html?roomId=${r.id}">立即预约</a>
                </div>
            </div>

            <div class="schedule-card">
                <div class="schedule-card__title">📅 占用情况</div>
                <div class="mr-form__row mb-md">
                    <input class="mr-input" type="date" id="schDate" value="${state.date}">
                </div>
                <div class="schedule-list">${slotsHtml}</div>
            </div>
        `;

        const dateInput = document.getElementById('schDate');
        if (dateInput) {
            dateInput.addEventListener('change', (e) => {
                state.date = e.target.value || state.date;
                loadSchedule();
            });
        }
    }

    function tagOfStatus(code) {
        if (code === 1) return 'tag--primary';
        if (code === 2) return 'tag--success';
        if (code === 0) return 'tag--warn';
        return 'tag--default';
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!MR.Auth.requireLogin()) return;
        MR.Header.render('appHeader', { active: 'rooms' });
        load();
    });
})();
