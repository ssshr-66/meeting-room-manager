package com.xhs.meetingroom.vo.notice;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.xhs.meetingroom.entity.Notice;
import com.xhs.meetingroom.enums.NoticeTypeEnum;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NoticeVO {

    private Long id;
    private String title;
    private String content;
    private Integer type;
    private String typeDesc;
    private Integer priority;
    private String priorityDesc;
    private Long publisherId;
    private String publisherNickname;
    private Integer status;
    private String statusDesc;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime publishAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    public static NoticeVO from(Notice n) {
        if (n == null) return null;
        NoticeVO vo = new NoticeVO();
        vo.setId(n.getId());
        vo.setTitle(n.getTitle());
        vo.setContent(n.getContent());
        vo.setType(n.getType());
        vo.setTypeDesc(NoticeTypeEnum.descOf(n.getType()));
        vo.setPriority(n.getPriority());
        vo.setPriorityDesc(priorityDesc(n.getPriority()));
        vo.setPublisherId(n.getPublisherId());
        vo.setStatus(n.getStatus());
        vo.setStatusDesc(n.getStatus() != null && n.getStatus() == 1 ? "已发布" : "已下架");
        vo.setPublishAt(n.getPublishAt());
        vo.setCreatedAt(n.getCreatedAt());
        return vo;
    }

    private static String priorityDesc(Integer p) {
        if (p == null) return "普通";
        return switch (p) {
            case 1 -> "重要";
            case 2 -> "紧急";
            default -> "普通";
        };
    }
}
