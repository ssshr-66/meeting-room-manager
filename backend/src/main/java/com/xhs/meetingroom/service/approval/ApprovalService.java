package com.xhs.meetingroom.service.approval;

import com.xhs.meetingroom.common.page.PageVO;
import com.xhs.meetingroom.dto.approval.ApprovalActionDTO;
import com.xhs.meetingroom.dto.approval.ApprovalQueryDTO;
import com.xhs.meetingroom.vo.approval.ApprovalVO;

public interface ApprovalService {

    PageVO<ApprovalVO> page(ApprovalQueryDTO query);

    ApprovalVO getById(Long id);

    /** 审批操作（通过 / 驳回） */
    void action(Long id, ApprovalActionDTO dto);
}
