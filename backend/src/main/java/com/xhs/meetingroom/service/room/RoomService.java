package com.xhs.meetingroom.service.room;

import com.xhs.meetingroom.common.page.PageVO;
import com.xhs.meetingroom.dto.room.RoomCreateDTO;
import com.xhs.meetingroom.dto.room.RoomQueryDTO;
import com.xhs.meetingroom.dto.room.RoomUpdateDTO;
import com.xhs.meetingroom.vo.room.RoomScheduleVO;
import com.xhs.meetingroom.vo.room.RoomVO;

import java.time.LocalDate;
import java.util.List;

public interface RoomService {

    PageVO<RoomVO> page(RoomQueryDTO query);

    /** 不分页列表（用于预约下拉等场景） */
    List<RoomVO> listAll(Integer status);

    RoomVO getById(Long id);

    /** 指定日期会议室占用情况 */
    RoomScheduleVO getSchedule(Long roomId, LocalDate date);

    /* ========== 管理员 ========== */
    Long create(RoomCreateDTO dto);

    void update(Long id, RoomUpdateDTO dto);

    void delete(Long id);
}
