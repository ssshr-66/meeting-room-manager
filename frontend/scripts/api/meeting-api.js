/** 会议接口：签到 / 纪要 */
(function () {
    'use strict';

    MR.MeetingApi = {
        qrcode(reservationId) {
            return MR.Request.get('/meetings/' + reservationId + '/qrcode');
        },

        signIn(reservationId, signType, signToken) {
            return MR.Request.post('/meetings/signin', {
                reservationId,
                signType: signType || 2,
                signToken: signToken || null,
            });
        },

        listSignins(reservationId) {
            return MR.Request.get('/meetings/' + reservationId + '/signins');
        },

        createMinute(payload) {
            return MR.Request.post('/meetings/minutes', payload);
        },

        deleteMinute(id) {
            return MR.Request.del('/meetings/minutes/' + id);
        },

        listMinutes(reservationId) {
            return MR.Request.get('/meetings/' + reservationId + '/minutes');
        },
    };
})();
