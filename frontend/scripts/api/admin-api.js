/** 管理员综合接口：用户管理 / 会议室管理 / 预约管理（聚合到一个命名空间） */
(function () {
    'use strict';

    MR.AdminApi = {
        /* ===== 用户 ===== */
        userPage(params) {
            return MR.Request.get('/admin/users', params);
        },
        setUserStatus(id, status) {
            return MR.Request.put('/admin/users/' + id + '/status?status=' + status);
        },

        /* ===== 会议室 ===== */
        createRoom(payload) {
            return MR.Request.post('/admin/rooms', payload);
        },
        updateRoom(id, payload) {
            return MR.Request.put('/admin/rooms/' + id, payload);
        },
        deleteRoom(id) {
            return MR.Request.del('/admin/rooms/' + id);
        },

        /* ===== 预约记录 ===== */
        reservationPage(params) {
            return MR.Request.get('/admin/reservations', params);
        },
        forceCancelReservation(id, reason) {
            return MR.Request.post(
                '/admin/reservations/' + id + '/cancel?reason=' + encodeURIComponent(reason || '违规取消'));
        },
    };
})();
