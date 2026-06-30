package com.xhs.meetingroom.service.reservation;

import com.xhs.meetingroom.common.page.PageVO;
import com.xhs.meetingroom.dto.reservation.*;
import com.xhs.meetingroom.vo.reservation.ReservationVO;

import java.util.List;

public interface ReservationService {

    Long create(ReservationCreateDTO dto);

    void update(Long id, ReservationUpdateDTO dto);

    void cancel(Long id, ReservationCancelDTO dto);

    ReservationVO getById(Long id);

    /** 我的预约（按当前登录用户） */
    PageVO<ReservationVO> myPage(ReservationQueryDTO query);

    /** 我参与的会议（attendee 列表包含我，或我创建的） */
    List<ReservationVO> myUpcomingMeetings();

    /** 管理员：全量查询 */
    PageVO<ReservationVO> adminPage(ReservationQueryDTO query);

    /** 管理员强制取消 */
    void forceCancel(Long id, String reason);
}
