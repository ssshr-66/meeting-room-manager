package com.xhs.meetingroom.controller.notice;

import com.xhs.meetingroom.common.page.PageVO;
import com.xhs.meetingroom.common.result.Result;
import com.xhs.meetingroom.dto.notice.NoticeQueryDTO;
import com.xhs.meetingroom.service.notice.NoticeService;
import com.xhs.meetingroom.vo.notice.NoticeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户端 - 公告（白名单部分接口提供未登录访问）。
 */
@RestController
@RequestMapping("/api/v1/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    /** 公开：最新公告（首页用） */
    @GetMapping("/public/latest")
    public Result<List<NoticeVO>> latest(@RequestParam(defaultValue = "5") int limit) {
        return Result.ok(noticeService.latestPublished(limit));
    }

    /** 公告列表（已发布） */
    @GetMapping
    public Result<PageVO<NoticeVO>> page(NoticeQueryDTO query) {
        return Result.ok(noticeService.publishedPage(query));
    }

    /** 公告详情 */
    @GetMapping("/{id}")
    public Result<NoticeVO> detail(@PathVariable Long id) {
        return Result.ok(noticeService.getById(id));
    }
}
