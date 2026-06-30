package com.xhs.meetingroom.controller.statistic;

import com.xhs.meetingroom.common.result.Result;
import com.xhs.meetingroom.interceptor.AdminOnly;
import com.xhs.meetingroom.service.statistic.StatisticService;
import com.xhs.meetingroom.vo.statistic.HourDistributionVO;
import com.xhs.meetingroom.vo.statistic.OverviewVO;
import com.xhs.meetingroom.vo.statistic.RoomUsageVO;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 管理员 - 使用统计。
 */
@RestController
@RequestMapping("/api/v1/admin/statistics")
@RequiredArgsConstructor
@AdminOnly
public class AdminStatisticController {

    private final StatisticService statisticService;

    /** 控制台概览数字 */
    @GetMapping("/overview")
    public Result<OverviewVO> overview() {
        return Result.ok(statisticService.overview());
    }

    /** 会议室使用率 */
    @GetMapping("/room-usage")
    public Result<List<RoomUsageVO>> roomUsage(
            @RequestParam(defaultValue = "week") String period,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate baseDate) {
        return Result.ok(statisticService.roomUsage(period, baseDate));
    }

    /** 热门会议室 TOP N */
    @GetMapping("/top-rooms")
    public Result<List<RoomUsageVO>> topRooms(
            @RequestParam(defaultValue = "week") String period,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate baseDate,
            @RequestParam(defaultValue = "5") int limit) {
        return Result.ok(statisticService.topRooms(period, baseDate, limit));
    }

    /** 时段（0-23）占用分布 */
    @GetMapping("/hour-distribution")
    public Result<List<HourDistributionVO>> hourDist(
            @RequestParam(defaultValue = "week") String period,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate baseDate) {
        return Result.ok(statisticService.hourDistribution(period, baseDate));
    }
}
