package com.xhs.meetingroom.service.statistic;

import com.xhs.meetingroom.vo.statistic.HourDistributionVO;
import com.xhs.meetingroom.vo.statistic.OverviewVO;
import com.xhs.meetingroom.vo.statistic.RoomUsageVO;

import java.time.LocalDate;
import java.util.List;

public interface StatisticService {

    OverviewVO overview();

    /**
     * 会议室使用率统计。
     * @param period day/week/month
     */
    List<RoomUsageVO> roomUsage(String period, LocalDate baseDate);

    /** 热门会议室 Top N */
    List<RoomUsageVO> topRooms(String period, LocalDate baseDate, int limit);

    /** 各时段（0-23）占用分布 */
    List<HourDistributionVO> hourDistribution(String period, LocalDate baseDate);
}
