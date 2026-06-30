package com.xhs.meetingroom.service.notice.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xhs.meetingroom.common.context.UserContext;
import com.xhs.meetingroom.common.exception.BusinessException;
import com.xhs.meetingroom.common.page.PageVO;
import com.xhs.meetingroom.common.result.ResultCode;
import com.xhs.meetingroom.dto.notice.NoticeCreateDTO;
import com.xhs.meetingroom.dto.notice.NoticeQueryDTO;
import com.xhs.meetingroom.dto.notice.NoticeUpdateDTO;
import com.xhs.meetingroom.entity.Notice;
import com.xhs.meetingroom.entity.User;
import com.xhs.meetingroom.mapper.NoticeMapper;
import com.xhs.meetingroom.mapper.UserMapper;
import com.xhs.meetingroom.service.notice.NoticeService;
import com.xhs.meetingroom.vo.notice.NoticeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {

    private final NoticeMapper noticeMapper;
    private final UserMapper userMapper;

    @Override
    public List<NoticeVO> latestPublished(int limit) {
        Page<Notice> page = new Page<>(1, Math.max(1, Math.min(limit, 20)));
        noticeMapper.selectPage(page, new LambdaQueryWrapper<Notice>()
                .eq(Notice::getStatus, 1)
                .orderByDesc(Notice::getPriority)
                .orderByDesc(Notice::getPublishAt));
        return enrich(page.getRecords());
    }

    @Override
    public PageVO<NoticeVO> publishedPage(NoticeQueryDTO query) {
        LambdaQueryWrapper<Notice> w = buildWrapper(query).eq(Notice::getStatus, 1);
        Page<Notice> page = new Page<>(query.getPageNum(), query.getPageSize());
        noticeMapper.selectPage(page, w
                .orderByDesc(Notice::getPriority)
                .orderByDesc(Notice::getPublishAt));
        List<NoticeVO> records = enrich(page.getRecords());
        return new PageVO<>(page.getTotal(), page.getCurrent(), page.getSize(), records);
    }

    @Override
    public NoticeVO getById(Long id) {
        Notice n = noticeMapper.selectById(id);
        if (n == null) throw new BusinessException(ResultCode.NOTICE_NOT_EXIST);
        return enrich(List.of(n)).get(0);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create(NoticeCreateDTO dto) {
        Long me = UserContext.requireUserId();
        Notice n = new Notice();
        n.setTitle(dto.getTitle());
        n.setContent(dto.getContent());
        n.setType(dto.getType());
        n.setPriority(dto.getPriority() != null ? dto.getPriority() : 0);
        n.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        n.setPublisherId(me);
        if (n.getStatus() == 1) n.setPublishAt(LocalDateTime.now());
        noticeMapper.insert(n);
        return n.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, NoticeUpdateDTO dto) {
        Notice exist = noticeMapper.selectById(id);
        if (exist == null) throw new BusinessException(ResultCode.NOTICE_NOT_EXIST);
        Notice u = new Notice();
        u.setId(id);
        if (dto.getTitle() != null)    u.setTitle(dto.getTitle());
        if (dto.getContent() != null)  u.setContent(dto.getContent());
        if (dto.getType() != null)     u.setType(dto.getType());
        if (dto.getPriority() != null) u.setPriority(dto.getPriority());
        if (dto.getStatus() != null) {
            u.setStatus(dto.getStatus());
            if (dto.getStatus() == 1 && exist.getPublishAt() == null) {
                u.setPublishAt(LocalDateTime.now());
            }
        }
        noticeMapper.updateById(u);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        if (noticeMapper.selectById(id) == null) throw new BusinessException(ResultCode.NOTICE_NOT_EXIST);
        noticeMapper.deleteById(id);
    }

    @Override
    public PageVO<NoticeVO> adminPage(NoticeQueryDTO query) {
        LambdaQueryWrapper<Notice> w = buildWrapper(query).orderByDesc(Notice::getCreatedAt);
        Page<Notice> page = new Page<>(query.getPageNum(), query.getPageSize());
        noticeMapper.selectPage(page, w);
        List<NoticeVO> records = enrich(page.getRecords());
        return new PageVO<>(page.getTotal(), page.getCurrent(), page.getSize(), records);
    }

    private LambdaQueryWrapper<Notice> buildWrapper(NoticeQueryDTO q) {
        LambdaQueryWrapper<Notice> w = new LambdaQueryWrapper<>();
        if (q.getKeyword() != null && !q.getKeyword().isBlank()) w.like(Notice::getTitle, q.getKeyword());
        if (q.getType() != null)   w.eq(Notice::getType, q.getType());
        if (q.getStatus() != null) w.eq(Notice::getStatus, q.getStatus());
        return w;
    }

    private List<NoticeVO> enrich(List<Notice> list) {
        if (list == null || list.isEmpty()) return new ArrayList<>();
        List<Long> uids = list.stream().map(Notice::getPublisherId).filter(Objects::nonNull).distinct().toList();
        Map<Long, User> userMap = uids.isEmpty() ? Map.of()
                : userMapper.selectByIds(uids).stream()
                    .collect(Collectors.toMap(User::getId, x -> x, (a, b) -> a));
        return list.stream().map(n -> {
            NoticeVO vo = NoticeVO.from(n);
            User u = userMap.get(n.getPublisherId());
            if (u != null) vo.setPublisherNickname(u.getNickname());
            return vo;
        }).collect(Collectors.toList());
    }
}
