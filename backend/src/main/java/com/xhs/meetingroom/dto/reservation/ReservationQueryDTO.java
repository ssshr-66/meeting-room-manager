package com.xhs.meetingroom.dto.reservation;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.xhs.meetingroom.common.page.PageReq;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
public class ReservationQueryDTO extends PageReq {

    /** 状态 */
    private Integer status;

    /** 会议室 */
    private Long roomId;

    /** 预约人（管理员用） */
    private Long userId;

    /** 关键字：标题模糊 */
    private String keyword;

    /** 时间范围 */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
}
