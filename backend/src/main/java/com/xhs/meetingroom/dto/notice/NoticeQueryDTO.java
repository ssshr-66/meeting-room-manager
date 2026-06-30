package com.xhs.meetingroom.dto.notice;

import com.xhs.meetingroom.common.page.PageReq;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class NoticeQueryDTO extends PageReq {
    private String keyword;
    private Integer type;
    private Integer status;
}
