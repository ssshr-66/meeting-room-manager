/** 管理员控制台 */
(function () {
    'use strict';

    async function loadOverview() {
        try {
            const o = await MR.StatisticApi.overview();
            document.getElementById('overviewGrid').innerHTML = `
                <div class="overview-card">
                    <div class="overview-card__label">注册用户</div>
                    <div class="overview-card__value">${o.totalUsers}</div>
                </div>
                <div class="overview-card">
                    <div class="overview-card__label">会议室总数</div>
                    <div class="overview-card__value">${o.totalRooms}</div>
                </div>
                <div class="overview-card overview-card--success">
                    <div class="overview-card__label">今日预约</div>
                    <div class="overview-card__value">${o.todayReservations}</div>
                </div>
                <div class="overview-card overview-card--warning">
                    <div class="overview-card__label">待审批</div>
                    <div class="overview-card__value">${o.pendingApprovals}</div>
                </div>
                <div class="overview-card">
                    <div class="overview-card__label">进行中</div>
                    <div class="overview-card__value">${o.activeReservations}</div>
                </div>
            `;
        } catch (e) {
            MR.Notify.error('加载概览失败：' + (e.message || ''));
        }
    }

    async function loadTopRooms() {
        const tbody = document.querySelector('#topRoomsTable tbody');
        try {
            const list = await MR.StatisticApi.topRooms('week', null, 5);
            if (!list.length) {
                tbody.innerHTML = '<tr><td colspan="4" class="mr-table__empty">本周暂无数据</td></tr>';
                return;
            }
            tbody.innerHTML = list.map(r => `
                <tr>
                    <td>${MR.escapeHtml(r.roomName)}</td>
                    <td><span class="tag tag--info">${r.usageRate}%</span></td>
                    <td>${r.totalHours} 小时</td>
                    <td>${r.reservationCount}</td>
                </tr>
            `).join('');
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="4" class="mr-table__empty text-danger">加载失败：${MR.escapeHtml(e.message)}</td></tr>`;
        }
    }

    async function loadPending() {
        const box = document.getElementById('pendingApprovals');
        try {
            const res = await MR.ApprovalApi.page({ status: 0, pageNum: 1, pageSize: 5 });
            const list = res.records || [];
            if (!list.length) {
                box.innerHTML = '<span class="text-tertiary">暂无待审批</span>';
                return;
            }
            box.innerHTML = list.map(a => {
                const r = a.reservation || {};
                return `
                    <div class="res-card res-card--pending" style="margin-bottom:8px;border-radius:6px">
                        <div class="res-card__title" style="font-size:14px">${MR.escapeHtml(r.title || '')}</div>
                        <div class="res-card__meta" style="font-size:12px">
                            <span>${MR.escapeHtml(r.roomName || '')}</span>
                            <span>${MR.escapeHtml(r.userNickname || '')}</span>
                            <span>${MR.formatDate(r.startTime, 'MM-dd HH:mm')}</span>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (e) {
            box.innerHTML = `<span class="text-danger">${MR.escapeHtml(e.message)}</span>`;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!MR.Auth.requireLogin()) return;
        if (!MR.Auth.isAdmin()) {
            MR.Notify.warn('需要管理员权限');
            setTimeout(() => location.href = '/', 800);
            return;
        }
        MR.Header.render('appHeader', { active: 'admin-home', adminMode: true });
        loadOverview();
        loadTopRooms();
        loadPending();
    });
})();
