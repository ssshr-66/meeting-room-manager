/** 登录页 */
(function () {
    'use strict';

    function setError(msg) {
        const el = document.getElementById('loginError');
        if (el) el.textContent = msg || '';
    }

    async function onSubmit(e) {
        e.preventDefault();
        setError('');
        const form = e.target;
        const username = form.username.value.trim();
        const password = form.password.value;
        if (!username || !password) {
            setError('请输入用户名和密码');
            return;
        }
        const btn = document.getElementById('loginBtn');
        btn.disabled = true;
        btn.textContent = '登录中...';
        try {
            const data = await MR.AuthApi.login(username, password);
            MR.Auth.login(data.token, data.user);
            MR.Notify.success('登录成功');
            // 根据角色跳转
            const redirect = MR.parseQuery().redirect;
            if (redirect) {
                location.href = decodeURIComponent(redirect);
            } else if (data.user && data.user.role === 2) {
                location.href = '/pages/admin/dashboard.html';
            } else {
                location.href = '/';
            }
        } catch (err) {
            setError(err.message || '登录失败');
        } finally {
            btn.disabled = false;
            btn.textContent = '登录';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        // 已登录直接回首页
        if (MR.Auth.isLoggedIn()) {
            location.href = '/';
            return;
        }
        const form = document.getElementById('loginForm');
        if (form) form.addEventListener('submit', onSubmit);
    });
})();
