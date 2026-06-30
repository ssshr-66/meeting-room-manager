/**
 * 会议签到页：
 * - 头部展示会议信息
 * - 左：签到（组织者展示签到二维码，参会者展示手动签到按钮 + 已签到列表）
 * - 右：纪要上传 + 列表
 */
(function () {
    'use strict';

    const state = {
        reservationId: null,
        reservation: null,
    };

    async function loadHeader() {
        try {
            state.reservation = await MR.ReservationApi.detail(state.reservationId);
        } catch (e) {
            return MR.Notify.error('加载失败：' + (e.message || ''));
        }
        const r = state.reservation;
        document.getElementById('meetingHeader').innerHTML = `
            <div class="card">
                <div class="flex-between">
                    <div>
                        <h2 class="page-title" style="margin-bottom:4px">${MR.escapeHtml(r.title)}</h2>
                        <div class="res-card__meta">
                            <span>🏢 ${MR.escapeHtml(r.roomName || '')}</span>
                            <span>🕒 ${MR.formatDate(r.startTime)} ~ ${MR.formatDate(r.endTime, 'HH:mm')}</span>
                            <span>👥 ${r.attendeeCount} 人</span>
                            <span>${r.ownByMe ? '我创建' : '我参与'}</span>
                        </div>
                    </div>
                    <span class="tag tag--primary">${MR.escapeHtml(r.statusDesc)}</span>
                </div>
                ${r.description ? `<p class="res-card__desc">${MR.escapeHtml(r.description)}</p>` : ''}
            </div>
        `;

        renderSigninPanel();
    }

    function renderSigninPanel() {
        const panel = document.getElementById('signinPanel');
        if (state.reservation.ownByMe) {
            // 组织者：展示二维码
            panel.innerHTML = `
                <div class="qrcode-card">
                    <div id="qrcodeBox" class="qrcode-card__img" style="display:flex;align-items:center;justify-content:center;color:#aaa">
                        <span>点击下方按钮生成二维码</span>
                    </div>
                    <div id="qrCodeTokenBox"></div>
                    <button class="btn mt-md" id="genQrBtn">生成签到二维码</button>
                    <button class="btn btn--ghost mt-md" id="manualBtn">作为组织者手动签到</button>
                </div>
            `;
            document.getElementById('genQrBtn').addEventListener('click', generateQr);
            document.getElementById('manualBtn').addEventListener('click', () => doSignin(2, null));
        } else {
            // 参会者：手动签到
            panel.innerHTML = `
                <div class="qrcode-card">
                    <p class="text-secondary mb-md">请向组织者获取签到二维码扫码签到，或直接点击手动签到。</p>
                    <button class="btn" id="manualBtn">手动签到</button>
                </div>
            `;
            document.getElementById('manualBtn').addEventListener('click', () => doSignin(2, null));
        }
    }

    async function generateQr() {
        try {
            const data = await MR.MeetingApi.qrcode(state.reservationId);
            const box = document.getElementById('qrcodeBox');
            // 使用 google chart api 简易生成（在线兜底）；离线场景占位
            const encoded = encodeURIComponent(data.qrContent);
            box.innerHTML = `<img alt="QR" style="max-width:100%;max-height:100%"
                src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encoded}">`;
            document.getElementById('qrCodeTokenBox').innerHTML = `
                <div class="qrcode-card__token">Token: ${MR.escapeHtml(data.signToken).slice(0, 16)}... | 过期: ${MR.formatDate(new Date(data.expireAt))}</div>
            `;
            MR.Notify.success('二维码已生成（演示用，可手动签到验证）');
        } catch (e) {
            MR.Notify.error(e.message || '生成失败');
        }
    }

    async function doSignin(signType, signToken) {
        try {
            await MR.MeetingApi.signIn(state.reservationId, signType, signToken);
            MR.Notify.success('签到成功');
            loadSignins();
        } catch (e) {
            MR.Notify.error(e.message || '签到失败');
        }
    }

    async function loadSignins() {
        const box = document.getElementById('signinList');
        try {
            const list = await MR.MeetingApi.listSignins(state.reservationId);
            if (!list.length) {
                box.innerHTML = '<span class="text-tertiary">暂无签到记录</span>';
                return;
            }
            box.innerHTML = list.map(s => `
                <div class="signin-item">
                    <span>👤 ${MR.escapeHtml(s.userNickname || ('用户#' + s.userId))}</span>
                    <span class="text-tertiary">${MR.escapeHtml(s.signTypeDesc)} · ${MR.formatDate(s.signAt)}</span>
                </div>
            `).join('');
        } catch (e) {
            box.innerHTML = `<span class="text-danger">加载失败：${MR.escapeHtml(e.message || '')}</span>`;
        }
    }

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

    document.addEventListener('DOMContentLoaded', () => {
        if (!MR.Auth.requireLogin()) return;
        MR.Header.render('appHeader', { active: 'meetings' });

        const id = MR.parseQuery().id;
        if (!id) {
            document.querySelector('main').innerHTML = '<div class="state-block"><div class="state-block__title">缺少会议 ID</div></div>';
            return;
        }
        state.reservationId = Number(id);
        loadHeader();
        loadSignins();
        loadMinutes();
        document.getElementById('minuteForm').addEventListener('submit', onCreateMinute);
    });
})();
