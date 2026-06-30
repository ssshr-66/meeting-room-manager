package com.xhs.meetingroom.common.page;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

/**
 * 分页请求基类，业务 DTO 可继承。
 */
@Data
public class PageReq {

    @Min(value = 1, message = "页码必须大于等于 1")
    private Long pageNum = 1L;

    @Min(value = 1, message = "每页大小必须大于等于 1")
    @Max(value = 100, message = "每页大小不能超过 100")
    private Long pageSize = 20L;
}
