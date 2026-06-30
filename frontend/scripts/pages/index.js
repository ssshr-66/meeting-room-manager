/**
 * 首页：渲染 Header + 公告 + 我的即将到来会议 + Hero 操作区。
 */
(function () {
    'use strict';

    function renderHeroActions() {
        const el = document.getElementById('heroActions');
        if (!el) return;
        if (MR.Auth.isLoggedIn()) {
            el.innerHTML = `
                <a class="btn" href="/pages/reservation/reservation-create.html">立即预约</a>
                <a class="btn btn--ghost" href="/pages/room/room-list.html">浏览会议室</a>
            `;
        } else {
            el.innerHTML = `
                <a class="btn" href="/pages/user/login.html">登录</a>
                <a class="btn btn--ghost" href="/pages/user/register.html">注册</a>
            `;
        }
    }

    async function loadNotices() {
        const ul = document.getElementById('noticeList');
        if (!ul) return;
        try {
            const list = await MR.NoticeApi.publicLatest(5);
            if (!list || !list.length) {
                ul.innerHTML = '<li class="text-tertiary">暂无公告</li>';
                return;
            }
            ul.innerHTML = list.map(n => `
                <li class="priority-${n.priority || 0}">
                    <div class="notice-title">${MR.escapeHtml(n.title)}</div>
                    <div class="notice-meta">${MR.escapeHtml(n.typeDesc || '')} · ${MR.formatDate(n.publishAt)}</div>
                </li>
            `).join('');
        } catch (e) {
            ul.innerHTML = `<li class="text-danger">加载失败：${MR.escapeHtml(e.message || '未知错误')}</li>`;
        }
    }

    async function loadUpcoming() {
        const ul = document.getElementById('upcomingList');
        if (!ul) return;
        if (!MR.Auth.isLoggedIn()) return;
        try {
            const list = await MR.ReservationApi.myUpcoming();
            if (!list || !list.length) {
                ul.innerHTML = '<li class="text-tertiary">暂无即将到来的会议</li>';
                return;
            }
            ul.innerHTML = list.slice(0, 5).map(r => `
                <li>
                    <div class="notice-title">${MR.escapeHtml(r.title)}</div>
                    <div class="meeting-meta">
                        ${MR.escapeHtml(r.roomName || '')} · ${MR.formatDate(r.startTime)} ~ ${MR.formatDate(r.endTime, 'HH:mm')}
                        · <span class="tag tag--info">${MR.escapeHtml(r.statusDesc)}</span>
                    </div>
                </li>
            `).join('');
        } catch (e) {
            ul.innerHTML = `<li class="text-danger">加载失败：${MR.escapeHtml(e.message || '')}</li>`;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        MR.Header.render('appHeader', { active: 'home' });
        renderHeroActions();
        loadNotices();
        loadUpcoming();
    });
})();
