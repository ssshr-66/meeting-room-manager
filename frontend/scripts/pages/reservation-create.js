/** 创建预约 */
(function () {
    'use strict';

    const state = {
        rooms: [],
        room: null,
    };

    function setError(msg) {
        document.getElementById('resError').textContent = msg || '';
    }

    /** 渲染会议室下拉 */
    async function loadRooms() {
        const sel = document.getElementById('roomSel');
        try {
            state.rooms = await MR.RoomApi.listAll(1);   // 仅可用
            sel.innerHTML = '<option value="">请选择会议室</option>' +
                state.rooms.map(r =>
                    `<option value="${r.id}">${MR.escapeHtml(r.name)} · ${MR.escapeHtml(r.floor)} · ${r.capacity} 人 ${r.needApproval ? '(需审批)' : ''}</option>`
                ).join('');

            // URL 参数指定 roomId
            const preset = MR.parseQuery().roomId;
            if (preset) {
                sel.value = preset;
                onRoomChange();
            }
        } catch (e) {
            sel.innerHTML = '<option value="">加载失败</option>';
            MR.Notify.error('加载会议室失败：' + (e.message || ''));
        }
    }

    async function onRoomChange() {
        const sel = document.getElementById('roomSel');
        const id = sel.value;
        if (!id) {
            state.room = null;
            renderSummary();
            return;
        }
        state.room = state.rooms.find(r => String(r.id) === String(id)) || null;
        renderSummary();
        // 自动拉取当天占用
        if (state.room) {
            const d = new Date().toISOString().slice(0, 10);
            const sch = await MR.RoomApi.schedule(state.room.id, d).catch(() => ({ slots: [] }));
            renderScheduleHint(sch);
        }
    }

    function renderSummary() {
        const box = document.getElementById('roomSummary');
        if (!state.room) {
            box.innerHTML = '<div class="state-block">请选择会议室</div>';
            return;
        }
        const r = state.room;
        box.innerHTML = `
            <div class="room-summary__name">${MR.escapeHtml(r.name)}</div>
            <div class="room-summary__meta">
                <span>🏢 ${MR.escapeHtml(r.floor)} ${MR.escapeHtml(r.location || '')}</span>
                <span>👥 容纳 ${r.capacity} 人</span>
                ${r.needApproval ? '<span class="tag tag--warn">需审批</span>' : '<span class="tag tag--success">免审批</span>'}
            </div>
            <div class="room-summary__equipments">
                ${(r.equipmentList || []).map(e => `<span class="tag tag--info">${MR.escapeHtml(e)}</span>`).join('')}
            </div>
            <p class="text-tertiary mb-md">${MR.escapeHtml(r.description || '')}</p>
            <div class="room-summary__schedule-title">今日占用</div>
            <div class="room-summary__schedule" id="summaryScheduleBox">
                <span class="text-tertiary">加载中...</span>
            </div>
        `;
    }

    function renderScheduleHint(sch) {
        const el = document.getElementById('summaryScheduleBox');
        if (!el) return;
        const slots = sch && sch.slots ? sch.slots : [];
        if (slots.length === 0) {
            el.innerHTML = '<span class="text-success">今日尚无预约，时段空闲 ✅</span>';
            return;
        }
        el.innerHTML = slots.map(s => `
            <div class="room-summary__schedule-item">
                ${MR.formatDate(s.startTime, 'HH:mm')} - ${MR.formatDate(s.endTime, 'HH:mm')}
                · ${MR.escapeHtml(s.title)}
            </div>`).join('');
    }

    async function onSubmit(e) {
        e.preventDefault();
        setError('');
        const f = e.target;
        const payload = {
            roomId: Number(f.roomId.value),
            title: f.title.value.trim(),
            startTime: toServerTime(f.startTime.value),
            endTime: toServerTime(f.endTime.value),
            attendeeCount: Number(f.attendeeCount.value),
            description: f.description.value.trim() || null,
        };
        if (!payload.roomId)    return setError('请选择会议室');
        if (!payload.title)     return setError('请输入会议主题');
        if (!payload.startTime || !payload.endTime) return setError('请选择起止时间');
        if (new Date(payload.startTime.replace(' ', 'T')) >= new Date(payload.endTime.replace(' ', 'T'))) {
            return setError('结束时间必须晚于开始时间');
        }
        if (payload.attendeeCount < 1) return setError('参会人数至少 1 人');

        const btn = document.getElementById('submitBtn');
        btn.disabled = true; btn.textContent = '提交中...';
        try {
            const id = await MR.ReservationApi.create(payload);
            MR.Notify.success('预约提交成功');
            setTimeout(() => location.href = '/pages/reservation/my-reservations.html', 800);
        } catch (err) {
            setError(err.message || '提交失败');
        } finally {
            btn.disabled = false; btn.textContent = '提交预约';
        }
    }

    /** datetime-local 转 "yyyy-MM-dd HH:mm:ss" */
    function toServerTime(s) {
        if (!s) return null;
        return s.replace('T', ' ') + (s.length === 16 ? ':00' : '');
    }

    /** 默认填充：开始 = 今天 14:00；结束 = 15:00 */
    function fillDefaultTime() {
        const f = document.getElementById('resForm');
        const now = new Date();
        const d = now.toISOString().slice(0, 10);
        f.startTime.value = d + 'T14:00';
        f.endTime.value = d + 'T15:00';
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!MR.Auth.requireLogin()) return;
        MR.Header.render('appHeader', { active: 'rooms' });
        fillDefaultTime();
        document.getElementById('roomSel').addEventListener('change', onRoomChange);
        document.getElementById('resForm').addEventListener('submit', onSubmit);
        loadRooms();
    });
})();
