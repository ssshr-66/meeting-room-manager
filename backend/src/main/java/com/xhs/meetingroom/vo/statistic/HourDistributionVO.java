package com.xhs.meetingroom.vo.statistic;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HourDistributionVO {
    /** 0-23 */
    private Integer hour;
    private Long count;
}
