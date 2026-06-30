/** 注册页 */
(function () {
    'use strict';

    function setError(msg) {
        const el = document.getElementById('regError');
        if (el) el.textContent = msg || '';
    }

    async function onSubmit(e) {
        e.preventDefault();
        setError('');
        const f = e.target;
        const payload = {
            username:   f.username.value.trim(),
            password:   f.password.value,
            nickname:   f.nickname.value.trim(),
            email:      f.email.value.trim(),
            employeeNo: f.employeeNo.value.trim() || null,
            phone:      f.phone.value.trim() || null,
            department: f.department.value.trim() || null,
        };
        if (!payload.username || !payload.password || !payload.nickname || !payload.email) {
            setError('请填写所有必填字段');
            return;
        }
        const btn = document.getElementById('regBtn');
        btn.disabled = true;
        btn.textContent = '注册中...';
        try {
            await MR.AuthApi.register(payload);
            MR.Notify.success('注册成功，正在跳转登录...');
            setTimeout(() => location.href = '/pages/user/login.html', 1200);
        } catch (err) {
            setError(err.message || '注册失败');
        } finally {
            btn.disabled = false;
            btn.textContent = '注册';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const f = document.getElementById('regForm');
        if (f) f.addEventListener('submit', onSubmit);
    });
})();
