/** 会议室接口 */
(function () {
    'use strict';

    MR.RoomApi = {
        page(params) {
            return MR.Request.get('/rooms', params);
        },

        listAll(status) {
            return MR.Request.get('/rooms/all', status != null ? { status } : null);
        },

        detail(id) {
            return MR.Request.get('/rooms/' + id);
        },

        /** @param {Date|string} date */
        schedule(id, date) {
            let d = date;
            if (date instanceof Date) {
                d = date.toISOString().slice(0, 10);
            }
            return MR.Request.get('/rooms/' + id + '/schedule', d ? { date: d } : null);
        },
    };
})();
