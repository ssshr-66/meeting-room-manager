/**
 * 会议签到页：
 * - 头部：会议信息（含 已签到/应到 实时统计）
 * - 左：签到面板——参会人员列表，每人显示签到状态；当前登录用户行可点签到
 * - 右：会议纪要 上传/列表/删除
 *
 * 注：本系统定位是「会议室排期管理」，签到表示「人员实际到达线下会议室」，
 * 作为使用率与违约率统计依据。不提供视频会议/在线会议室功能。
 */
(function () {
    'use strict';

    const state = {
        reservationId: null,
        reservation: null,
        signins: [],
    };

    /* ===== 头部 ===== */

    async function loadHeader() {
        try {
            state.reservation = await MR.ReservationApi.detail(state.reservationId);
        } catch (e) {
            return MR.Notify.error('加载失败：' + (e.message || ''));
        }
        renderHeader();
    }

    function renderHeader() {
        const r = state.reservation;
        const expected = (r.attendees && r.attendees.length) || r.attendeeCount || 0;
        const signed = state.signins.length;
        document.getElementById('meetingHeader').innerHTML = `
            <div class="card">
                <div class="flex-between">
                    <div>
                        <h2 class="page-title" style="margin-bottom:4px">${MR.escapeHtml(r.title)}</h2>
                        <div class="res-card__meta">
                            <span>🏢 ${MR.escapeHtml(r.roomName || '')}</span>
                            <span>🕒 ${MR.formatDate(r.startTime)} ~ ${MR.formatDate(r.endTime, 'HH:mm')}</span>
                            <span>👥 应到 ${expected} 人</span>
                            <span class="text-success">✅ 已到 ${signed} 人</span>
                            <span>${r.ownByMe ? '我创建' : '我参与'}</span>
                        </div>
                    </div>
                    <span class="tag tag--primary">${MR.escapeHtml(r.statusDesc)}</span>
                </div>
                ${r.description ? `<p class="res-card__desc">${MR.escapeHtml(r.description)}</p>` : ''}
            </div>
        `;
    }

    /* ===== 签到面板（左侧） ===== */

    function renderSigninPanel() {
        const panel = document.getElementById('signinPanel');
        const r = state.reservation;
        const me = MR.Auth.getUser();
        const meId = me ? me.id : null;
        const signMap = new Map(state.signins.map(s => [s.userId, s]));
        const attendees = r.attendees || [];

        // 当前用户是否在参会名单（含组织者）
        const meInList = attendees.some(a => a.userId === meId);

        const tipHtml = `
            <div class="signin-tip">
                💡 <strong>签到说明</strong>：本系统是会议室排期管理平台。
                签到代表"人员实际到达<strong>线下会议室</strong>"，作为会议室使用率与违约率统计依据。
            </div>
        `;

        const listHtml = attendees.length === 0
            ? '<div class="text-tertiary text-center" style="padding:20px">本次会议没有指定参会人员</div>'
            : attendees.map(a => {
                const sign = signMap.get(a.userId);
                const isMe = a.userId === meId;
                return `
                    <div class="attendee-row ${sign ? 'is-signed' : ''} ${isMe ? 'is-me' : ''}">
                        <div class="attendee-row__avatar">${avatarChar(a.nickname)}</div>
                        <div class="attendee-row__info">
                            <div class="attendee-row__name">
                                ${MR.escapeHtml(a.nickname)}
                                ${a.isOrganizer ? '<span class="tag tag--primary" style="margin-left:6px;font-size:11px">组织者</span>' : ''}
                                ${isMe ? '<span class="tag tag--info" style="margin-left:4px;font-size:11px">我</span>' : ''}
                            </div>
                            <div class="attendee-row__meta">
                                ${MR.escapeHtml(a.department || '')}
                                ${a.employeeNo ? '· 工号 ' + MR.escapeHtml(a.employeeNo) : ''}
                            </div>
                        </div>
                        <div class="attendee-row__action">
                            ${sign
                                ? `<span class="text-success">✅ ${MR.formatDate(sign.signAt, 'HH:mm:ss')} 已签到</span>`
                                : (isMe
                                    ? `<button class="btn btn--small" data-act="signin" data-uid="${a.userId}">我要签到</button>`
                                    : '<span class="text-tertiary">⏳ 未签到</span>')}
                        </div>
                    </div>
                `;
            }).join('');

        const meNotInListHtml = (!meInList && meId)
            ? `<div class="signin-tip" style="margin-top:12px;background:#fff5f5;border-color:#ffd9d9;color:#c0392b">
                  ⚠️ 您不在本次会议的参会名单中，无法签到。
               </div>`
            : '';

        panel.innerHTML = tipHtml + '<div class="attendee-list">' + listHtml + '</div>' + meNotInListHtml;

        // 绑定签到按钮
        panel.querySelectorAll('[data-act="signin"]').forEach(btn => {
            btn.addEventListener('click', () => onSignIn());
        });
    }

    function avatarChar(name) {
        if (!name) return '?';
        return name.trim().charAt(0);
    }

    async function onSignIn() {
        try {
            await MR.MeetingApi.signIn(state.reservationId, 2, null);
            MR.Notify.success('签到成功');
            await loadSignins();
            renderHeader();
            renderSigninPanel();
        } catch (e) {
            MR.Notify.error(e.message || '签到失败');
        }
    }

    async function loadSignins() {
        try {
            state.signins = await MR.MeetingApi.listSignins(state.reservationId) || [];
        } catch (e) {
            state.signins = [];
            console.warn('[signin] 加载失败', e);
        }
    }

    /* ===== 纪要（右侧） ===== */

    async function onCreateMinute(e) {
        e.preventDefault();
        const f = e.target;
        const payload = {
            reservationId: state.reservationId,
            title: f.title.value.trim(),
            content: f.content.value.trim(),
            attachmentName: f.attachmentName.value.trim() || null,
            attachmentUrl: f.attachmentUrl.value.trim() || null,
        };
        if (!payload.title) return MR.Notify.warn('请输入纪要标题');
        try {
            await MR.MeetingApi.createMinute(payload);
            MR.Notify.success('纪要上传成功');
            f.reset();
            loadMinutes();
        } catch (err) {
            MR.Notify.error(err.message || '上传失败');
        }
    }

    async function loadMinutes() {
        const box = document.getElementById('minuteList');
        try {
            const list = await MR.MeetingApi.listMinutes(state.reservationId);
            if (!list.length) {
                box.innerHTML = '<span class="text-tertiary">暂无纪要</span>';
                return;
            }
            box.innerHTML = list.map(m => `
                <article class="minute-item" data-id="${m.id}">
                    <div class="minute-item__title">${MR.escapeHtml(m.title)}</div>
                    <div class="minute-item__meta">
                        ${MR.escapeHtml(m.uploaderNickname || '')} · ${MR.formatDate(m.createdAt)}
                        ${m.attachmentUrl ? `· <a href="${MR.escapeHtml(m.attachmentUrl)}" target="_blank">📎 ${MR.escapeHtml(m.attachmentName || '附件')}</a>` : ''}
                    </div>
                    <div class="minute-item__content">${MR.escapeHtml(m.content || '（无文字内容）')}</div>
                    <div class="flex-end mt-md">
                        <button class="btn btn--small btn--danger" data-act="del-minute">删除</button>
                    </div>
                </article>
            `).join('');
            box.querySelectorAll('[data-act="del-minute"]').forEach(b => {
                b.addEventListener('click', async () => {
                    const id = b.closest('.minute-item').dataset.id;
                    const ok = await MR.Notify.confirm('确认删除该纪要？');
                    if (!ok) return;
                    try {
                        await MR.MeetingApi.deleteMinute(Number(id));
                        MR.Notify.success('已删除');
                        loadMinutes();
                    } catch (e) {
                        MR.Notify.error(e.message);
                    }
                });
            });
        } catch (e) {
            box.innerHTML = `<span class="text-danger">加载失败：${MR.escapeHtml(e.message || '')}</span>`;
        }
    }

    /* ===== 入口 ===== */

    document.addEventListener('DOMContentLoaded', async () => {
        if (!MR.Auth.requireLogin()) return;
        MR.Header.render('appHeader', { active: 'meetings' });

        const id = MR.parseQuery().id;
        if (!id) {
            document.querySelector('main').innerHTML =
                '<div class="state-block"><div class="state-block__title">缺少会议 ID</div></div>';
            return;
        }
        state.reservationId = Number(id);

        // 先加载签到列表与会议详情，再渲染（确保头部统计准确）
        await loadHeader();
        await loadSignins();
        renderHeader();
        renderSigninPanel();
        loadMinutes();

        document.getElementById('minuteForm').addEventListener('submit', onCreateMinute);
    });
})();
