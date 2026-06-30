package com.xhs.meetingroom.dto.approval;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ApprovalActionDTO {

    /** 1=通过 2=驳回 */
    @NotNull(message = "审批结果不能为空")
    private Integer status;

    @Size(max = 255, message = "意见不超过 255 字")
    private String rejectReason;

    @Size(max = 255, message = "备注不超过 255 字")
    private String remark;
}
