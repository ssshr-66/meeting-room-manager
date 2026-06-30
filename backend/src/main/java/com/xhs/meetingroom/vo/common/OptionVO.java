package com.xhs.meetingroom.vo.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 通用 (label, value) 选项 VO，常用于下拉枚举。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OptionVO {
    private Object value;
    private String label;
}
