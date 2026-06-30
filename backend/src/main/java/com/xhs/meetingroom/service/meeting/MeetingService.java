package com.xhs.meetingroom.service.meeting;

import com.xhs.meetingroom.dto.meeting.MinuteCreateDTO;
import com.xhs.meetingroom.dto.meeting.SigninDTO;
import com.xhs.meetingroom.vo.meeting.MinuteVO;
import com.xhs.meetingroom.vo.meeting.QrCodeVO;
import com.xhs.meetingroom.vo.meeting.SigninVO;

import java.util.List;

public interface MeetingService {

    /** 生成会议签到二维码（仅会议组织者） */
    QrCodeVO generateQrCode(Long reservationId);

    /** 用户签到 */
    SigninVO signIn(SigninDTO dto);

    /** 某次会议的签到列表 */
    List<SigninVO> listSignins(Long reservationId);

    /* ========== 会议纪要 ========== */
    Long createMinute(MinuteCreateDTO dto);

    void deleteMinute(Long id);

    List<MinuteVO> listMinutes(Long reservationId);
}
