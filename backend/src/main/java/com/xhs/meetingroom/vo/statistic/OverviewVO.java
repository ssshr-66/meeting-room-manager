package com.xhs.meetingroom.vo.statistic;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 控制台概览。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OverviewVO {

    private Long totalUsers;
    private Long totalRooms;
    private Long todayReservations;
    private Long pendingApprovals;
    private Long activeReservations;  // 进行中
}
