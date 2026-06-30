package com.xhs.meetingroom.vo.meeting;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.xhs.meetingroom.entity.Minute;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MinuteVO {

    private Long id;
    private Long reservationId;
    private Long uploaderId;
    private String uploaderNickname;
    private String title;
    private String content;
    private String attachmentUrl;
    private String attachmentName;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    public static MinuteVO from(Minute m) {
        if (m == null) return null;
        MinuteVO vo = new MinuteVO();
        vo.setId(m.getId());
        vo.setReservationId(m.getReservationId());
        vo.setUploaderId(m.getUploaderId());
        vo.setTitle(m.getTitle());
        vo.setContent(m.getContent());
        vo.setAttachmentUrl(m.getAttachmentUrl());
        vo.setAttachmentName(m.getAttachmentName());
        vo.setCreatedAt(m.getCreatedAt());
        return vo;
    }
}
