package com.xhs.meetingroom.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xhs.meetingroom.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
