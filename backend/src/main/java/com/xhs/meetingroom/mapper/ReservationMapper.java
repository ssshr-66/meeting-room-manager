package com.xhs.meetingroom.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xhs.meetingroom.entity.Reservation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface ReservationMapper extends BaseMapper<Reservation> {

    /**
     * 时间冲突检测：返回与给定时段冲突的预约。
     *
     * @param roomId    会议室
     * @param startTime 起始时间
     * @param endTime   结束时间
     * @param excludeId 排除的预约 ID（修改时排除自身）；可为 null
     */
    List<Reservation> selectConflicts(@Param("roomId") Long roomId,
                                      @Param("startTime") LocalDateTime startTime,
                                      @Param("endTime") LocalDateTime endTime,
                                      @Param("excludeId") Long excludeId);

    /**
     * 按日期统计某会议室占用时长（小时）。
     */
    List<Map<String, Object>> statRoomUsageHours(@Param("startDate") LocalDateTime start,
                                                 @Param("endDate") LocalDateTime end);

    /**
     * 时段占用统计：按 0-23 小时桶聚合命中数。
     */
    List<Map<String, Object>> statHourlyDistribution(@Param("startDate") LocalDateTime start,
                                                     @Param("endDate") LocalDateTime end);
}
