package com.xhs.meetingroom.dto.approval;

import com.xhs.meetingroom.common.page.PageReq;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ApprovalQueryDTO extends PageReq {
    /** 审批状态：0 待审批 1 通过 2 驳回；不传查全部 */
    private Integer status;
}
