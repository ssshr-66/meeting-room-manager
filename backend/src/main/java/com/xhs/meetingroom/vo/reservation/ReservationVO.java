package com.xhs.meetingroom.vo.reservation;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.xhs.meetingroom.entity.Reservation;
import com.xhs.meetingroom.enums.ReservationStatusEnum;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class ReservationVO {

    private Long id;
    private Long userId;
    private String userNickname;
    private String userEmployeeNo;

    private Long roomId;
    private String roomName;
    private String roomFloor;

    private String title;
    private String description;
    private Integer attendeeCount;
    private List<Long> attendeeUserIds;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;

    private Integer status;
    private String statusDesc;

    private String cancelReason;

    /** 是否当前登录用户预约（前端区分操作权限） */
    private Boolean ownByMe;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    public static ReservationVO from(Reservation r) {
        if (r == null) return null;
        ReservationVO vo = new ReservationVO();
        vo.setId(r.getId());
        vo.setUserId(r.getUserId());
        vo.setRoomId(r.getRoomId());
        vo.setTitle(r.getTitle());
        vo.setDescription(r.getDescription());
        vo.setAttendeeCount(r.getAttendeeCount());
        vo.setAttendeeUserIds(parseIds(r.getAttendeeUserIds()));
        vo.setStartTime(r.getStartTime());
        vo.setEndTime(r.getEndTime());
        vo.setStatus(r.getStatus());
        vo.setStatusDesc(ReservationStatusEnum.descOf(r.getStatus()));
        vo.setCancelReason(r.getCancelReason());
        vo.setCreatedAt(r.getCreatedAt());
        return vo;
    }

    public static List<Long> parseIds(String csv) {
        if (csv == null || csv.isBlank()) return Collections.emptyList();
        return Arrays.stream(csv.split(","))
                .map(String::trim).filter(s -> !s.isEmpty())
                .map(Long::parseLong).collect(Collectors.toList());
    }
}
