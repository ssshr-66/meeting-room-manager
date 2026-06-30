package com.xhs.meetingroom.controller.admin;

import com.xhs.meetingroom.common.result.Result;
import com.xhs.meetingroom.dto.room.RoomCreateDTO;
import com.xhs.meetingroom.dto.room.RoomUpdateDTO;
import com.xhs.meetingroom.interceptor.AdminOnly;
import com.xhs.meetingroom.service.room.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 管理员 - 会议室管理。
 */
@RestController
@RequestMapping("/api/v1/admin/rooms")
@RequiredArgsConstructor
@AdminOnly
public class AdminRoomController {

    private final RoomService roomService;

    @PostMapping
    public Result<Long> create(@Valid @RequestBody RoomCreateDTO dto) {
        return Result.ok(roomService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody RoomUpdateDTO dto) {
        roomService.update(id, dto);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        roomService.delete(id);
        return Result.ok();
    }
}
