package com.xhs.meetingroom.controller.admin;

import com.xhs.meetingroom.common.page.PageVO;
import com.xhs.meetingroom.common.result.Result;
import com.xhs.meetingroom.dto.notice.NoticeCreateDTO;
import com.xhs.meetingroom.dto.notice.NoticeQueryDTO;
import com.xhs.meetingroom.dto.notice.NoticeUpdateDTO;
import com.xhs.meetingroom.interceptor.AdminOnly;
import com.xhs.meetingroom.service.notice.NoticeService;
import com.xhs.meetingroom.vo.notice.NoticeVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 管理员 - 公告管理。
 */
@RestController
@RequestMapping("/api/v1/admin/notices")
@RequiredArgsConstructor
@AdminOnly
public class AdminNoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public Result<PageVO<NoticeVO>> page(NoticeQueryDTO query) {
        return Result.ok(noticeService.adminPage(query));
    }

    @PostMapping
    public Result<Long> create(@Valid @RequestBody NoticeCreateDTO dto) {
        return Result.ok(noticeService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody NoticeUpdateDTO dto) {
        noticeService.update(id, dto);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        noticeService.delete(id);
        return Result.ok();
    }
}
