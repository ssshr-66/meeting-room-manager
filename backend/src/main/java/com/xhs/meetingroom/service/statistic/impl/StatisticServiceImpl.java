package com.xhs.meetingroom.service.statistic.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.xhs.meetingroom.common.exception.BusinessException;
import com.xhs.meetingroom.common.result.ResultCode;
import com.xhs.meetingroom.entity.Reservation;
import com.xhs.meetingroom.entity.Room;
import com.xhs.meetingroom.entity.User;
import com.xhs.meetingroom.enums.ApprovalStatusEnum;
import com.xhs.meetingroom.enums.ReservationStatusEnum;
import com.xhs.meetingroom.mapper.ApprovalMapper;
import com.xhs.meetingroom.mapper.ReservationMapper;
import com.xhs.meetingroom.mapper.RoomMapper;
import com.xhs.meetingroom.mapper.UserMapper;
import com.xhs.meetingroom.service.statistic.StatisticService;
import com.xhs.meetingroom.vo.statistic.HourDistributionVO;
import com.xhs.meetingroom.vo.statistic.OverviewVO;
import com.xhs.meetingroom.vo.statistic.RoomUsageVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.WeekFields;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StatisticServiceImpl implements StatisticService {

    /** 每日工作时长（用于计算使用率，9:00-21:00 共 12 小时） */
    private static final long DAILY_AVAILABLE_HOURS = 12;

    private final ReservationMapper reservationMapper;
    private final RoomMapper roomMapper;
    private final UserMapper userMapper;
    private final ApprovalMapper approvalMapper;

    @Override
    public OverviewVO overview() {
        Long totalUsers = userMapper.selectCount(null);
        Long totalRooms = roomMapper.selectCount(null);

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd   = todayStart.plusDays(1);
        Long todayRes = reservationMapper.selectCount(new LambdaQueryWrapper<Reservation>()
                .ge(Reservation::getStartTime, todayStart)
                .lt(Reservation::getStartTime, todayEnd));

        Long pending = approvalMapper.selectCount(new LambdaQueryWrapper<com.xhs.meetingroom.entity.Approval>()
                .eq(com.xhs.meetingroom.entity.Approval::getStatus, ApprovalStatusEnum.PENDING.getCode()));

        Long inProgress = reservationMapper.selectCount(new LambdaQueryWrapper<Reservation>()
                .eq(Reservation::getStatus, ReservationStatusEnum.IN_PROGRESS.getCode()));

        return new OverviewVO(totalUsers, totalRooms, todayRes, pending, inProgress);
    }

    @Override
    public List<RoomUsageVO> roomUsage(String period, LocalDate baseDate) {
        LocalDate base = baseDate != null ? baseDate : LocalDate.now();
        LocalDateTime[] range = periodRange(period, base);
        long days = Math.max(1, java.time.Duration.between(range[0], range[1]).toDays());

        List<Map<String, Object>> raw = reservationMapper.statRoomUsageHours(range[0], range[1]);
        List<RoomUsageVO> result = new ArrayList<>();
        for (Map<String, Object> row : raw) {
            Long roomId = toLong(row.get("roomId"));
            String name = String.valueOf(row.get("roomName"));
            long minutes = toLong(row.get("totalMinutes"));
            long count   = toLong(row.get("reservationCount"));
            double hours = minutes / 60.0;
            double usage = (hours / (DAILY_AVAILABLE_HOURS * days)) * 100;
            result.add(new RoomUsageVO(roomId, name, minutes,
                    Math.round(hours * 10) / 10.0, count,
                    Math.round(usage * 10) / 10.0));
        }
        return result;
    }

    @Override
    public List<RoomUsageVO> topRooms(String period, LocalDate baseDate, int limit) {
        List<RoomUsageVO> all = roomUsage(period, baseDate);
        return all.stream().limit(Math.max(1, limit)).toList();
    }

    @Override
    public List<HourDistributionVO> hourDistribution(String period, LocalDate baseDate) {
        LocalDate base = baseDate != null ? baseDate : LocalDate.now();
        LocalDateTime[] range = periodRange(period, base);
        List<Map<String, Object>> raw = reservationMapper.statHourlyDistribution(range[0], range[1]);
        Map<Integer, Long> map = new HashMap<>();
        for (Map<String, Object> row : raw) {
            map.put(((Number) row.get("hour")).intValue(), toLong(row.get("cnt")));
        }
        List<HourDistributionVO> result = new ArrayList<>(24);
        for (int h = 0; h < 24; h++) {
            result.add(new HourDistributionVO(h, map.getOrDefault(h, 0L)));
        }
        return result;
    }

    /* ============ helpers ============ */

    /** period: day / week / month；返回 [start, end) */
    private LocalDateTime[] periodRange(String period, LocalDate base) {
        if (period == null) period = "day";
        LocalDate start;
        LocalDate end;
        switch (period.toLowerCase()) {
            case "week" -> {
                WeekFields wf = WeekFields.of(Locale.CHINA);
                start = base.with(wf.dayOfWeek(), 1);
                end = start.plusWeeks(1);
            }
            case "month" -> {
                start = base.withDayOfMonth(1);
                end = start.plusMonths(1);
            }
            case "day" -> {
                start = base;
                end = start.plusDays(1);
            }
            default -> throw new BusinessException(ResultCode.STAT_RANGE_INVALID,
                    "period 必须是 day / week / month");
        }
        return new LocalDateTime[]{ start.atStartOfDay(), end.atStartOfDay() };
    }

    private long toLong(Object o) {
        if (o == null) return 0L;
        if (o instanceof Number n) return n.longValue();
        return Long.parseLong(o.toString());
    }
}
