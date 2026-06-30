/** 管理员统计接口 */
(function () {
    'use strict';

    MR.StatisticApi = {
        overview() {
            return MR.Request.get('/admin/statistics/overview');
        },

        roomUsage(period, baseDate) {
            return MR.Request.get('/admin/statistics/room-usage', {
                period: period || 'week',
                baseDate: baseDate || null,
            });
        },

        topRooms(period, baseDate, limit) {
            return MR.Request.get('/admin/statistics/top-rooms', {
                period: period || 'week',
                baseDate: baseDate || null,
                limit: limit || 5,
            });
        },

        hourDistribution(period, baseDate) {
            return MR.Request.get('/admin/statistics/hour-distribution', {
                period: period || 'week',
                baseDate: baseDate || null,
            });
        },
    };
})();
