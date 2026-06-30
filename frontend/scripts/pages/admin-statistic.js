/** 管理员 - 统计 */
(function () {
    'use strict';

    const state = { period: 'week' };

    async function loadAll() {
        await Promise.all([loadUsage(), loadTop(), loadHour()]);
    }

    async function loadUsage() {
        const box = document.getElementById('usageBars');
        try {
            const list = await MR.StatisticApi.roomUsage(state.period, null);
            if (!list.length) {
                box.innerHTML = '<div class="state-block">暂无数据</div>';
                return;
            }
            // 取使用率最大值，作为相对长度参照
            const max = Math.max(1, ...list.map(r => r.usageRate || 0));
            box.innerHTML = list.map(r => `
                <div class="usage-bar">
                    <div class="usage-bar__head">
                        <span class="name">${MR.escapeHtml(r.roomName)}</span>
                        <span class="value">${r.usageRate}% · ${r.totalHours}h · ${r.reservationCount} 次</span>
                    </div>
                    <div class="usage-bar__track">
                        <div class="usage-bar__fill" style="width: ${Math.min(100, (r.usageRate / max) * 100)}%"></div>
                    </div>
                </div>
            `).join('');
        } catch (e) {
            box.innerHTML = `<div class="state-block text-danger">${MR.escapeHtml(e.message || '')}</div>`;
        }
    }

    async function loadTop() {
        const tbody = document.querySelector('#topTable tbody');
        try {
            const list = await MR.StatisticApi.topRooms(state.period, null, 10);
            if (!list.length) {
                tbody.innerHTML = '<tr><td colspan="4" class="mr-table__empty">暂无数据</td></tr>';
                return;
            }
            tbody.innerHTML = list.map((r, i) => `
                <tr>
                    <td>#${i + 1}</td>
                    <td><strong>${MR.escapeHtml(r.roomName)}</strong></td>
                    <td>${r.totalHours}</td>
                    <td>${r.reservationCount}</td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="4" class="mr-table__empty text-danger">${MR.escapeHtml(e.message || '')}</td></tr>`;
        }
    }

    async function loadHour() {
        const chart = document.getElementById('hourChart');
        try {
            const list = await MR.StatisticApi.hourDistribution(state.period, null);
            const max = Math.max(1, ...list.map(x => x.count || 0));
            chart.innerHTML = list.map(h => `
                <div class="hour-chart__bar"
                     style="height: ${Math.max(2, (h.count / max) * 100)}%"
                     data-cnt="${h.count} 次"></div>
            `).join('') + `
                <div class="hour-chart__axis" style="position:absolute;left:0;right:0;bottom:-20px">
                    ${list.map(h => `<span>${h.hour}</span>`).join('')}
                </div>
            `;
        } catch (e) {
            chart.innerHTML = `<div class="state-block text-danger">${MR.escapeHtml(e.message || '')}</div>`;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!MR.Auth.requireLogin()) return;
        if (!MR.Auth.isAdmin()) {
            MR.Notify.warn('需要管理员权限');
            setTimeout(() => location.href = '/', 800);
            return;
        }
        MR.Header.render('appHeader', { active: 'admin-stat', adminMode: true });
        document.getElementById('periodSel').addEventListener('change', (e) => {
            state.period = e.target.value;
            loadAll();
        });
        document.getElementById('refreshBtn').addEventListener('click', loadAll);
        loadAll();
    });
})();
