/** 会议室列表 */
(function () {
    'use strict';

    const state = {
        view: 'grid',
        page: { pageNum: 1, pageSize: 12 },
        filter: { keyword: '', floor: '', minCapacity: '', equipment: '' },
        rooms: [],
        total: 0,
        // 日历相关
        calDate: new Date().toISOString().slice(0, 10),
        floorOptions: new Set(),
    };

    /* ===== 渲染：网格视图 ===== */
    function renderGrid() {
        const box = document.getElementById('gridView');
        if (!box) return;
        if (!state.rooms.length) {
            box.innerHTML = `<div class="state-block" style="grid-column: 1/-1">
                <div class="state-block__title">没有匹配的会议室</div>
                <div>调整筛选条件后重试</div>
            </div>`;
            return;
        }
        box.innerHTML = state.rooms.map(r => `
            <article class="room-card" data-id="${r.id}">
                <header class="room-card__header">
                    <span class="room-card__name">${MR.escapeHtml(r.name)}</span>
                    <span class="tag ${tagOfStatus(r.status)}">${MR.escapeHtml(r.statusDesc || '')}</span>
                </header>
                <div class="room-card__meta">
                    <span class="room-card__meta-item">🏢 ${MR.escapeHtml(r.floor)} ${MR.escapeHtml(r.location || '')}</span>
                    <span class="room-card__meta-item">👥 ${r.capacity} 人</span>
                    ${r.needApproval === 1 ? '<span class="tag tag--warn">需审批</span>' : ''}
                </div>
                <div class="room-card__equipments">
                    ${(r.equipmentList || []).map(e => `<span class="tag tag--info">${MR.escapeHtml(e)}</span>`).join('')}
                </div>
                <div class="room-card__desc">${MR.escapeHtml(r.description || '—')}</div>
                <div class="room-card__actions">
                    <a class="btn btn--small btn--ghost" href="/pages/room/room-detail.html?id=${r.id}">查看详情</a>
                    <a class="btn btn--small" href="/pages/reservation/reservation-create.html?roomId=${r.id}">立即预约</a>
                </div>
            </article>
        `).join('');
        // 点击卡片空白处也跳详情
        box.querySelectorAll('.room-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('a, button')) return;
                const id = card.dataset.id;
                if (id) location.href = '/pages/room/room-detail.html?id=' + id;
            });
        });
    }

    function tagOfStatus(code) {
        if (code === 1) return 'tag--success';
        if (code === 2) return 'tag--warn';
        return 'tag--default';
    }

    /* ===== 渲染：日历视图 ===== */
    async function renderCalendar() {
        const box = document.getElementById('calendarBody');
        if (!box) return;
        if (!state.rooms.length) {
            box.innerHTML = '<div class="state-block">没有可用会议室</div>';
            return;
        }
        box.innerHTML = '<div class="text-tertiary text-center mb-md">加载占用情况中...</div>';
        // 并发拉取
        const tasks = state.rooms.map(r => MR.RoomApi.schedule(r.id, state.calDate).catch(() => null));
        const schedules = await Promise.all(tasks);

        box.innerHTML = state.rooms.map((r, i) => {
            const sch = schedules[i];
            return `
                <div class="calendar-row">
                    <div class="calendar-row__room-info">
                        <div class="name">${MR.escapeHtml(r.name)}</div>
                        <div class="meta">${MR.escapeHtml(r.floor)} · ${r.capacity} 人</div>
                    </div>
                    <div class="calendar-row__timeline" data-room-id="${r.id}">
                        <div class="timeline-axis">
                            ${[8,10,12,14,16,18,20].map(h => `<span>${h}:00</span>`).join('')}
                        </div>
                        ${renderSlots(sch ? sch.slots : [])}
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderSlots(slots) {
        // 时间轴 8:00 - 21:00（13 小时），按比例定位
        const dayStart = 8 * 60, dayEnd = 21 * 60;
        const total = dayEnd - dayStart;
        return (slots || []).map(s => {
            const start = parseMin(s.startTime);
            const end = parseMin(s.endTime);
            if (end <= dayStart || start >= dayEnd) return '';
            const l = Math.max(0, start - dayStart) / total * 100;
            const w = Math.min(dayEnd - Math.max(start, dayStart), end - Math.max(start, dayStart)) / total * 100;
            const cls = s.status === 0 ? 'timeline-slot--pending' :
                        s.status === 2 ? 'timeline-slot--inProgress' : '';
            return `<div class="timeline-slot ${cls}" style="left:${l}%;width:${w}%"
                         title="${MR.escapeHtml(s.title)} | ${MR.escapeHtml(s.userNickname || '')} | ${MR.formatDate(s.startTime, 'HH:mm')}-${MR.formatDate(s.endTime, 'HH:mm')}">
                        ${MR.escapeHtml(s.title)}
                    </div>`;
        }).join('');
    }

    function parseMin(dt) {
        const d = new Date(String(dt).replace(' ', 'T'));
        return d.getHours() * 60 + d.getMinutes();
    }

    /* ===== 加载 ===== */
    async function load() {
        const params = Object.assign({}, state.filter, state.page);
        try {
            const res = await MR.RoomApi.page(params);
            state.rooms = res.records || [];
            state.total = res.total || 0;
            (state.rooms || []).forEach(r => { if (r.floor) state.floorOptions.add(r.floor); });
            renderFloorOptions();
            if (state.view === 'grid') renderGrid();
            else renderCalendar();
            renderPager();
        } catch (e) {
            MR.Notify.error('加载失败：' + (e.message || ''));
        }
    }

    function renderFloorOptions() {
        const sel = document.getElementById('floorSel');
        if (!sel) return;
        const current = sel.value;
        const opts = ['<option value="">所有楼层</option>'].concat(
            Array.from(state.floorOptions).sort().map(f => `<option value="${MR.escapeHtml(f)}">${MR.escapeHtml(f)}</option>`)
        );
        sel.innerHTML = opts.join('');
        sel.value = current;
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
        document.getElementById('kwInput').addEventListener('input', (e) => {
            state.filter.keyword = e.target.value.trim();
            apply();
        });
        document.getElementById('floorSel').addEventListener('change', (e) => {
            state.filter.floor = e.target.value;
            state.page.pageNum = 1; load();
        });
        document.getElementById('capSel').addEventListener('change', (e) => {
            state.filter.minCapacity = e.target.value;
            state.page.pageNum = 1; load();
        });
        document.getElementById('eqSel').addEventListener('change', (e) => {
            state.filter.equipment = e.target.value;
            state.page.pageNum = 1; load();
        });
        document.getElementById('viewSel').addEventListener('change', (e) => {
            state.view = e.target.value;
            switchView();
        });
        document.getElementById('resetBtn').addEventListener('click', () => {
            state.filter = { keyword: '', floor: '', minCapacity: '', equipment: '' };
            ['kwInput','floorSel','capSel','eqSel'].forEach(id => { document.getElementById(id).value = ''; });
            state.page.pageNum = 1; load();
        });
        const calInput = document.getElementById('calDate');
        calInput.value = state.calDate;
        calInput.addEventListener('change', (e) => {
            state.calDate = e.target.value || state.calDate;
            renderCalendar();
        });
    }

    function switchView() {
        document.getElementById('gridView').hidden = state.view !== 'grid';
        document.getElementById('calendarView').hidden = state.view !== 'calendar';
        if (state.view === 'grid') renderGrid();
        else renderCalendar();
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!MR.Auth.requireLogin()) return;
        MR.Header.render('appHeader', { active: 'rooms' });
        bindFilters();
        load();
    });
})();
