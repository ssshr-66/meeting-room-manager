package com.xhs.meetingroom.controller.approval;

import com.xhs.meetingroom.common.page.PageVO;
import com.xhs.meetingroom.common.result.Result;
import com.xhs.meetingroom.dto.approval.ApprovalActionDTO;
import com.xhs.meetingroom.dto.approval.ApprovalQueryDTO;
import com.xhs.meetingroom.interceptor.AdminOnly;
import com.xhs.meetingroom.service.approval.ApprovalService;
import com.xhs.meetingroom.vo.approval.ApprovalVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 管理员 - 预约审批。
 */
@RestController
@RequestMapping("/api/v1/admin/approvals")
@RequiredArgsConstructor
@AdminOnly
public class AdminApprovalController {

    private final ApprovalService approvalService;

    @GetMapping
    public Result<PageVO<ApprovalVO>> page(ApprovalQueryDTO query) {
        return Result.ok(approvalService.page(query));
    }

    @GetMapping("/{id}")
    public Result<ApprovalVO> detail(@PathVariable Long id) {
        return Result.ok(approvalService.getById(id));
    }

    @PostMapping("/{id}/action")
    public Result<Void> action(@PathVariable Long id, @Valid @RequestBody ApprovalActionDTO dto) {
        approvalService.action(id, dto);
        return Result.ok();
    }
}
