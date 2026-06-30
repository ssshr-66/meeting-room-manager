package com.xhs.meetingroom.controller.room;

import com.xhs.meetingroom.common.page.PageVO;
import com.xhs.meetingroom.common.result.Result;
import com.xhs.meetingroom.dto.room.RoomQueryDTO;
import com.xhs.meetingroom.service.room.RoomService;
import com.xhs.meetingroom.vo.room.RoomScheduleVO;
import com.xhs.meetingroom.vo.room.RoomVO;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 用户端 - 会议室浏览。
 */
@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    /** 分页列表 */
    @GetMapping
    public Result<PageVO<RoomVO>> page(RoomQueryDTO query) {
        return Result.ok(roomService.page(query));
    }

    /** 全量列表（用于下拉等） */
    @GetMapping("/all")
    public Result<List<RoomVO>> all(@RequestParam(required = false) Integer status) {
        return Result.ok(roomService.listAll(status));
    }

    /** 详情 */
    @GetMapping("/{id}")
    public Result<RoomVO> detail(@PathVariable Long id) {
        return Result.ok(roomService.getById(id));
    }

    /** 指定日期占用情况（默认今天） */
    @GetMapping("/{id}/schedule")
    public Result<RoomScheduleVO> schedule(@PathVariable Long id,
                                           @RequestParam(required = false)
                                           @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return Result.ok(roomService.getSchedule(id, date));
    }
}
