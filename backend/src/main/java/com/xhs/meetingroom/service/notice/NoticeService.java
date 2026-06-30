package com.xhs.meetingroom.service.notice;

import com.xhs.meetingroom.common.page.PageVO;
import com.xhs.meetingroom.dto.notice.NoticeCreateDTO;
import com.xhs.meetingroom.dto.notice.NoticeQueryDTO;
import com.xhs.meetingroom.dto.notice.NoticeUpdateDTO;
import com.xhs.meetingroom.vo.notice.NoticeVO;

import java.util.List;

public interface NoticeService {

    /** 用户端：最新已发布公告（用于首页 / 弹窗） */
    List<NoticeVO> latestPublished(int limit);

    /** 用户端：公告分页（仅查询已发布） */
    PageVO<NoticeVO> publishedPage(NoticeQueryDTO query);

    NoticeVO getById(Long id);

    /* 管理员 */
    Long create(NoticeCreateDTO dto);
    void update(Long id, NoticeUpdateDTO dto);
    void delete(Long id);
    PageVO<NoticeVO> adminPage(NoticeQueryDTO query);
}
