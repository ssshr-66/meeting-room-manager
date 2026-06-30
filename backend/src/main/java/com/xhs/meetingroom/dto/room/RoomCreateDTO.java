package com.xhs.meetingroom.dto.room;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RoomCreateDTO {

    @NotBlank(message = "会议室名称不能为空")
    @Size(max = 64, message = "名称不超过 64 字")
    private String name;

    @NotBlank(message = "楼层不能为空")
    private String floor;

    private String location;

    @NotNull(message = "容纳人数不能为空")
    @Min(value = 1, message = "容纳人数至少为 1")
    @Max(value = 500, message = "容纳人数不超过 500")
    private Integer capacity;

    /** 设备列表（逗号分隔） */
    private String equipment;

    private String description;

    private String coverImage;

    @NotNull(message = "是否需要审批不能为空")
    private Integer needApproval;

    /** 默认 1=可用 */
    private Integer status = 1;
}
