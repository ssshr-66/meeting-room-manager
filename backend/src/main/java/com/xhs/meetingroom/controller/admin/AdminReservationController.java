package com.xhs.meetingroom.controller.admin;

import com.xhs.meetingroom.common.page.PageVO;
import com.xhs.meetingroom.common.result.Result;
import com.xhs.meetingroom.dto.reservation.ReservationQueryDTO;
import com.xhs.meetingroom.interceptor.AdminOnly;
import com.xhs.meetingroom.service.reservation.ReservationService;
import com.xhs.meetingroom.vo.reservation.ReservationVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 管理员 - 预约记录管理。
 */
@RestController
@RequestMapping("/api/v1/admin/reservations")
@RequiredArgsConstructor
@AdminOnly
public class AdminReservationController {

    private final ReservationService reservationService;

    /** 全量预约分页查询 */
    @GetMapping
    public Result<PageVO<ReservationVO>> page(ReservationQueryDTO query) {
        return Result.ok(reservationService.adminPage(query));
    }

    /** 管理员强制取消 */
    @PostMapping("/{id}/cancel")
    public Result<Void> forceCancel(@PathVariable Long id, @RequestParam(required = false) String reason) {
        reservationService.forceCancel(id, reason);
        return Result.ok();
    }
}
