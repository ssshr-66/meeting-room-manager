/** 审批接口（管理员） */
(function () {
    'use strict';

    MR.ApprovalApi = {
        page(params) {
            return MR.Request.get('/admin/approvals', params);
        },

        detail(id) {
            return MR.Request.get('/admin/approvals/' + id);
        },

        /**
         * @param {number} id
         * @param {1|2} status 1 通过 / 2 驳回
         * @param {string} [rejectReason]
         * @param {string} [remark]
         */
        action(id, status, rejectReason, remark) {
            return MR.Request.post('/admin/approvals/' + id + '/action', {
                status, rejectReason, remark,
            });
        },
    };
})();
