package com.xhs.meetingroom.dto.user;

import com.xhs.meetingroom.common.page.PageReq;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class UserQueryDTO extends PageReq {

    /** 关键字：用户名 / 昵称 / 邮箱 / 工号 模糊 */
    private String keyword;

    /** 角色过滤 */
    private Integer role;

    /** 状态过滤 */
    private Integer status;
}
