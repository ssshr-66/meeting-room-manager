/**
 * Mock handlers - 审批：/admin/approvals*
 */
(function () {
    'use strict';
    const D = MR.MockData;
    const H = MR.MockHelpers;
    const reg = (m, p, fn) => MR.Mock.register(m, p, fn);

    function requireAdmin(cu) {
        if (!cu) throw H.bizError(1002, '未登录');
        if (cu.role !== 2) throw H.bizError(1003, '需要管理员权限');
    }

    /** GET /admin/approvals */
    reg('GET', '/admin/approvals', async ({ currentUser, params }) => {
        requireAdmin(currentUser);
        const status = params.status !== '' && params.status != null ? Number(params.status) : null;
        let list = D.approvals.filter(a => status === null || a.status === status);
        // 待审批优先 + 创建时间倒序
        list.sort((a, b) => a.status - b.status || b.createdAt.localeCompare(a.createdAt));
        const page = H.paginate(list, params);
        const ctx = H.buildCtx(currentUser.id);
        page.records = page.records.map(a => enrich(a, ctx));
        return page;
    });

    /** GET /admin/approvals/:id */
    reg('GET', '/admin/approvals/:id', async ({ currentUser, pathParams }) => {
        requireAdmin(currentUser);
        const a = D.approvals.find(x => x.id === Number(pathParams.id));
        if (!a) throw H.bizError(5001, '审批记录不存在');
        return enrich(a, H.buildCtx(currentUser.id));
    });

    /** POST /admin/approvals/:id/action */
    reg('POST', '/admin/approvals/:id/action', async ({ currentUser, pathParams, body }) => {
        requireAdmin(currentUser);
        const a = D.approvals.find(x => x.id === Number(pathParams.id));
        if (!a) throw H.bizError(5001, '审批记录不存在');
        if (a.status !== 0) throw H.bizError(5002, '该申请已审批完成');
        const status = body && body.status;
        if (![1, 2].includes(Number(status))) throw H.bizError(1001, '审批结果必须为通过或驳回');
        if (Number(status) === 2 && (!body.rejectReason || !String(body.rejectReason).trim())) {
            throw H.bizError(5003, '驳回必须填写原因');
        }
        a.status = Number(status);
        a.approverId = currentUser.id;
        a.approvedAt = D.now();
        a.rejectReason = a.status === 2 ? body.rejectReason : null;
        a.remark = body.remark || null;
        a.updatedAt = D.now();

        // 同步更新预约状态
        const r = D.reservations.find(x => x.id === a.reservationId);
        if (r) {
            r.status = a.status === 1 ? 1 : 5;
            if (a.status === 2) r.cancelReason = '审批驳回: ' + a.rejectReason;
            r.updatedAt = D.now();
        }
        return null;
    });

    /* ===== 富化 ===== */

    function enrich(a, ctx) {
        const r = D.reservations.find(x => x.id === a.reservationId);
        const approver = a.approverId ? ctx.userMap.get(a.approverId) : null;
        return {
            id: a.id,
            reservationId: a.reservationId,
            approverId: a.approverId,
            approverNickname: approver ? approver.nickname : null,
            status: a.status,
            statusDesc: H.APPR_DESC[a.status] || '',
            rejectReason: a.rejectReason,
            remark: a.remark,
            approvedAt: a.approvedAt,
            createdAt: a.createdAt,
            reservation: r ? H.reservationVO(r, ctx) : null,
        };
    }
})();
