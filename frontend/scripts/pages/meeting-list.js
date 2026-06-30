/** 我的会议（即将开始 + 已开始） */
(function () {
    'use strict';

    async function load() {
        const box = document.getElementById('meetingListBox');
        try {
            const list = await MR.ReservationApi.myUpcoming();
            if (!list || !list.length) {
                box.innerHTML = `<div class="state-block">
                    <div class="state-block__title">暂无即将到来的会议</div>
                    <a class="btn mt-md" href="/pages/reservation/reservation-create.html">立即预约</a>
                </div>`;
                return;
            }
            box.innerHTML = list.map(r => `
                <article class="res-card ${r.status === 2 ? 'res-card--completed' : ''}">
                    <header class="res-card__header">
                        <div>
                            <div class="res-card__title">${MR.escapeHtml(r.title)}</div>
                            <div class="res-card__meta">
                                <span>🏢 ${MR.escapeHtml(r.roomName || '')}</span>
                                <span>🕒 ${MR.formatDate(r.startTime)} ~ ${MR.formatDate(r.endTime, 'HH:mm')}</span>
                                <span>👥 ${r.attendeeCount} 人</span>
                                <span class="${r.ownByMe ? 'text-success' : 'text-secondary'}">${r.ownByMe ? '我创建' : '我参与'}</span>
                            </div>
                        </div>
                        <span class="tag ${tagOfStatus(r.status)}">${MR.escapeHtml(r.statusDesc)}</span>
                    </header>
                    ${r.description ? `<div class="res-card__desc">${MR.escapeHtml(r.description)}</div>` : ''}
                    <div class="res-card__actions">
                        <a class="btn btn--small" href="/pages/meeting/meeting-check-in.html?id=${r.id}">进入会议</a>
                    </div>
                </article>
            `).join('');
        } catch (e) {
            MR.Notify.error('加载失败：' + (e.message || ''));
        }
    }

    function tagOfStatus(c) {
        switch (c) {
            case 0: return 'tag--warn';
            case 1: return 'tag--primary';
            case 2: return 'tag--success';
            default: return 'tag--default';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!MR.Auth.requireLogin()) return;
        MR.Header.render('appHeader', { active: 'meetings' });
        load();
    });
})();
