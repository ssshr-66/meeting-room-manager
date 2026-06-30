package com.xhs.meetingroom.vo.statistic;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomUsageVO {
    private Long roomId;
    private String roomName;
    /** 总占用分钟数 */
    private Long totalMinutes;
    /** 总占用小时数（带 1 位小数） */
    private Double totalHours;
    /** 预约次数 */
    private Long reservationCount;
    /** 使用率：占用时长 / 可用时长（百分比，带 1 位小数） */
    private Double usageRate;
}
