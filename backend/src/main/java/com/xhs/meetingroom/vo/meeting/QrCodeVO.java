package com.xhs.meetingroom.vo.meeting;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 签到二维码 VO：
 * - signToken: 一次性签到 token（time + reservationId 哈希），扫码后调用 /signin 时回传
 * - qrContent: 二维码内容（前端用 QRCode.js 渲染）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QrCodeVO {
    private Long reservationId;
    private String signToken;
    private String qrContent;
    /** Token 有效期截止时间（epoch millis） */
    private Long expireAt;
}
