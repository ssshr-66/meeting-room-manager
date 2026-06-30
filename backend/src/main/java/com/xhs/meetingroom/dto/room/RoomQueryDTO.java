package com.xhs.meetingroom.dto.room;

import com.xhs.meetingroom.common.page.PageReq;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class RoomQueryDTO extends PageReq {

    /** 关键字：名称模糊 */
    private String keyword;

    /** 最小容纳人数 */
    private Integer minCapacity;

    /** 楼层 */
    private String floor;

    /** 设备名（任一即可，简化：单设备 like 匹配） */
    private String equipment;

    /** 状态：可用 1 / 停用 0 / 维护 2；不传查全部可用 */
    private Integer status;
}
