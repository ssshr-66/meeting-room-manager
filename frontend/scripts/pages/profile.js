/** 个人中心 */
(function () {
    'use strict';

    const state = { user: null };

    async function loadProfile() {
        try {
            state.user = await MR.UserApi.me();
            fillForm(state.user);
            // 更新本地缓存
            MR.Storage.set(MR.Constants.USER_KEY, state.user);
        } catch (e) {
            MR.Notify.error('加载个人信息失败：' + (e.message || ''));
        }
    }

    function fillForm(u) {
        const f = document.getElementById('profileForm');
        if (!f || !u) return;
        f.username.value = u.username || '';
        f.employeeNo.value = u.employeeNo || '';
        f.nickname.value = u.nickname || '';
        f.email.value = u.email || '';
        f.phone.value = u.phone || '';
        f.department.value = u.department || '';
    }

    async function onSaveProfile(e) {
        e.preventDefault();
        const f = e.target;
        const payload = {
            nickname: f.nickname.value.trim(),
            email:    f.email.value.trim(),
            phone:    f.phone.value.trim(),
            department: f.department.value.trim(),
        };
        try {
            const u = await MR.UserApi.updateMe(payload);
            MR.Notify.success('保存成功');
            state.user = u;
            MR.Storage.set(MR.Constants.USER_KEY, u);
        } catch (err) {
            MR.Notify.error(err.message || '保存失败');
        }
    }

    async function onChangePwd(e) {
        e.preventDefault();
        const f = e.target;
        const oldPwd = f.oldPassword.value;
        const newPwd = f.newPassword.value;
        const conf   = f.confirmPassword.value;
        if (!oldPwd || !newPwd || !conf) return MR.Notify.warn('请填写所有密码字段');
        if (newPwd !== conf) return MR.Notify.warn('两次输入的新密码不一致');
        if (newPwd.length < 6) return MR.Notify.warn('新密码至少 6 位');
        try {
            await MR.UserApi.changePassword(oldPwd, newPwd);
            MR.Notify.success('密码修改成功，请重新登录');
            setTimeout(() => {
                MR.Auth.logout();
                location.href = '/pages/user/login.html';
            }, 1200);
        } catch (err) {
            MR.Notify.error(err.message || '修改失败');
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!MR.Auth.requireLogin()) return;
        MR.Header.render('appHeader', { active: 'profile' });
        loadProfile();
        document.getElementById('profileForm').addEventListener('submit', onSaveProfile);
        document.getElementById('pwdForm').addEventListener('submit', onChangePwd);
    });
})();
