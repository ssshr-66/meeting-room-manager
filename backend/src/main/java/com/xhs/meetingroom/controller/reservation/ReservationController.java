package com.xhs.meetingroom.controller.reservation;

import com.xhs.meetingroom.common.page.PageVO;
import com.xhs.meetingroom.common.result.Result;
import com.xhs.meetingroom.dto.reservation.*;
import com.xhs.meetingroom.service.reservation.ReservationService;
import com.xhs.meetingroom.vo.reservation.ReservationVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户端 - 预约管理。
 */
@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    /** 创建预约 */
    @PostMapping
    public Result<Long> create(@Valid @RequestBody ReservationCreateDTO dto) {
        return Result.ok(reservationService.create(dto));
    }

    /** 修改预约 */
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody ReservationUpdateDTO dto) {
        reservationService.update(id, dto);
        return Result.ok();
    }

    /** 取消预约 */
    @PostMapping("/{id}/cancel")
    public Result<Void> cancel(@PathVariable Long id,
                               @RequestBody(required = false) ReservationCancelDTO dto) {
        reservationService.cancel(id, dto);
        return Result.ok();
    }

    /** 预约详情 */
    @GetMapping("/{id}")
    public Result<ReservationVO> detail(@PathVariable Long id) {
        return Result.ok(reservationService.getById(id));
    }

    /** 我的预约 */
    @GetMapping("/my")
    public Result<PageVO<ReservationVO>> my(ReservationQueryDTO query) {
        return Result.ok(reservationService.myPage(query));
    }

    /** 我即将参与的会议（首页/提醒） */
    @GetMapping("/my/upcoming")
    public Result<List<ReservationVO>> myUpcoming() {
        return Result.ok(reservationService.myUpcomingMeetings());
    }
}
