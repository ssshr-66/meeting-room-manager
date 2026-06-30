package com.xhs.meetingroom.controller.meeting;

import com.xhs.meetingroom.common.result.Result;
import com.xhs.meetingroom.dto.meeting.MinuteCreateDTO;
import com.xhs.meetingroom.dto.meeting.SigninDTO;
import com.xhs.meetingroom.service.meeting.MeetingService;
import com.xhs.meetingroom.vo.meeting.MinuteVO;
import com.xhs.meetingroom.vo.meeting.QrCodeVO;
import com.xhs.meetingroom.vo.meeting.SigninVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户端 - 会议（签到 / 纪要）。
 */
@RestController
@RequestMapping("/api/v1/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    /** 生成签到二维码（仅组织者） */
    @GetMapping("/{reservationId}/qrcode")
    public Result<QrCodeVO> qrcode(@PathVariable Long reservationId) {
        return Result.ok(meetingService.generateQrCode(reservationId));
    }

    /** 签到（扫码或手动） */
    @PostMapping("/signin")
    public Result<SigninVO> signIn(@Valid @RequestBody SigninDTO dto) {
        return Result.ok(meetingService.signIn(dto));
    }

    /** 某次会议的签到列表 */
    @GetMapping("/{reservationId}/signins")
    public Result<List<SigninVO>> listSignins(@PathVariable Long reservationId) {
        return Result.ok(meetingService.listSignins(reservationId));
    }

    /** 上传会议纪要 */
    @PostMapping("/minutes")
    public Result<Long> createMinute(@Valid @RequestBody MinuteCreateDTO dto) {
        return Result.ok(meetingService.createMinute(dto));
    }

    /** 删除会议纪要 */
    @DeleteMapping("/minutes/{id}")
    public Result<Void> deleteMinute(@PathVariable Long id) {
        meetingService.deleteMinute(id);
        return Result.ok();
    }

    /** 某次会议的纪要列表 */
    @GetMapping("/{reservationId}/minutes")
    public Result<List<MinuteVO>> listMinutes(@PathVariable Long reservationId) {
        return Result.ok(meetingService.listMinutes(reservationId));
    }
}
