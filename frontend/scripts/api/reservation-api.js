/** 预约接口 */
(function () {
    'use strict';

    MR.ReservationApi = {
        create(payload) {
            return MR.Request.post('/reservations', payload);
        },

        update(id, payload) {
            return MR.Request.put('/reservations/' + id, payload);
        },

        cancel(id, reason) {
            return MR.Request.post('/reservations/' + id + '/cancel', { reason: reason || '' });
        },

        detail(id) {
            return MR.Request.get('/reservations/' + id);
        },

        myPage(params) {
            return MR.Request.get('/reservations/my', params);
        },

        myUpcoming() {
            return MR.Request.get('/reservations/my/upcoming');
        },
    };
})();
