/**
 * 顶部导航栏组件。
 *
 * 用法：
 *   <header id="appHeader"></header>
 *   MR.Header.render('appHeader', { active: 'rooms' });   // active 可选
 *
 * 自动根据登录角色显示用户端 / 管理员端入口；右上角显示昵称 / 退出登录。
 */
(function () {
    'use strict';

    const USER_NAV = [
        { key: 'home',         label: '首页',       href: '/' },
        { key: 'rooms',        label: '会议室',     href: '/pages/room/room-list.html' },
        { key: 'reservations', label: '我的预约',   href: '/pages/reservation/my-reservations.html' },
        { key: 'meetings',     label: '我的会议',   href: '/pages/meeting/meeting-list.html' },
        { key: 'profile',      label: '个人中心',   href: '/pages/user/profile.html' },
    ];

    const ADMIN_NAV = [
        { key: 'admin-home',   label: '控制台',     href: '/pages/admin/dashboard.html' },
        { key: 'admin-rooms',  label: '会议室管理', href: '/pages/admin/room-manage.html' },
        { key: 'admin-approval',label: '预约审批',  href: '/pages/admin/approval.html' },
        { key: 'admin-res',    label: '预约记录',   href: '/pages/admin/reservation-manage.html' },
        { key: 'admin-stat',   label: '使用统计',   href: '/pages/admin/statistic.html' },
        { key: 'admin-notice', label: '公告管理',   href: '/pages/admin/notice.html' },
        { key: 'admin-users',  label: '用户管理',   href: '/pages/admin/user-manage.html' },
    ];

    function render(targetId, opts) {
        const target = typeof targetId === 'string' ? document.getElementById(targetId) : targetId;
        if (!target) return;
        const o = opts || {};
        const isAdminMode = !!o.adminMode || (location.pathname.indexOf('/admin/') >= 0);
        const navList = isAdminMode ? ADMIN_NAV : USER_NAV;
        const user = MR.Auth.getUser();
        const activeKey = o.active || '';

        const navHtml = navList.map(it => `
            <a class="mr-header__nav-item ${it.key === activeKey ? 'is-active' : ''}" href="${it.href}">
                ${MR.escapeHtml(it.label)}
            </a>`).join('');

        target.className = 'mr-header';
        target.innerHTML = `
            <div class="mr-header__inner">
                <div class="mr-header__brand">
                    <a href="/" class="mr-header__logo">📅</a>
                    <span class="mr-header__title">智能会议室预约管理系统</span>
                    ${isAdminMode ? '<span class="mr-header__badge">管理后台</span>' : ''}
                </div>
                <nav class="mr-header__nav">${navHtml}</nav>
                <div class="mr-header__user">
                    ${user ? `
                        ${user.role === 2 && !isAdminMode
                            ? '<a class="mr-header__quick" href="/pages/admin/dashboard.html">→ 管理后台</a>'
                            : (user.role === 2 && isAdminMode
                                ? '<a class="mr-header__quick" href="/pages/room/room-list.html">→ 用户视图</a>'
                                : '')}
                        <span class="mr-header__nickname">${MR.escapeHtml(user.nickname || user.username)}</span>
                        <button class="mr-header__logout" id="mrHeaderLogout">退出</button>
                    ` : `
                        <a class="mr-header__login" href="/pages/user/login.html">登录</a>
                    `}
                </div>
            </div>
        `;

        const btn = document.getElementById('mrHeaderLogout');
        if (btn) {
            btn.addEventListener('click', () => {
                MR.Notify.confirm('确认退出登录？').then(ok => {
                    if (!ok) return;
                    MR.Auth.logout();
                    location.href = '/pages/user/login.html';
                });
            });
        }
    }

    MR.Header = { render };
})();
