package com.xhs.meetingroom.vo.room;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 会议室某日时段占用情况。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomScheduleVO {

    private Long roomId;
    private String roomName;
    private String date;  // yyyy-MM-dd
    private List<Slot> slots;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Slot {
        private Long reservationId;
        private String title;
        private String userNickname;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Integer status;
        private String statusDesc;
    }
}
