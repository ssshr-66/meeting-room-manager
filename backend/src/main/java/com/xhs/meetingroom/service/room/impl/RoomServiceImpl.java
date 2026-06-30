package com.xhs.meetingroom.service.room.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.xhs.meetingroom.common.exception.BusinessException;
import com.xhs.meetingroom.common.page.PageVO;
import com.xhs.meetingroom.common.result.ResultCode;
import com.xhs.meetingroom.dto.room.RoomCreateDTO;
import com.xhs.meetingroom.dto.room.RoomQueryDTO;
import com.xhs.meetingroom.dto.room.RoomUpdateDTO;
import com.xhs.meetingroom.entity.Reservation;
import com.xhs.meetingroom.entity.Room;
import com.xhs.meetingroom.entity.User;
import com.xhs.meetingroom.enums.ReservationStatusEnum;
import com.xhs.meetingroom.enums.RoomStatusEnum;
import com.xhs.meetingroom.mapper.ReservationMapper;
import com.xhs.meetingroom.mapper.RoomMapper;
import com.xhs.meetingroom.mapper.UserMapper;
import com.xhs.meetingroom.service.room.RoomService;
import com.xhs.meetingroom.vo.room.RoomScheduleVO;
import com.xhs.meetingroom.vo.room.RoomVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomMapper roomMapper;
    private final ReservationMapper reservationMapper;
    private final UserMapper userMapper;

    @Override
    public PageVO<RoomVO> page(RoomQueryDTO query) {
        LambdaQueryWrapper<Room> wrapper = new LambdaQueryWrapper<Room>()
                .like(query.getKeyword() != null && !query.getKeyword().isBlank(), Room::getName, query.getKeyword())
                .ge(query.getMinCapacity() != null, Room::getCapacity, query.getMinCapacity())
                .eq(query.getFloor() != null && !query.getFloor().isBlank(), Room::getFloor, query.getFloor())
                .like(query.getEquipment() != null && !query.getEquipment().isBlank(), Room::getEquipment, query.getEquipment())
                .eq(query.getStatus() != null, Room::getStatus, query.getStatus())
                .orderByAsc(Room::getFloor).orderByAsc(Room::getName);
        Page<Room> page = new Page<>(query.getPageNum(), query.getPageSize());
        roomMapper.selectPage(page, wrapper);
        return PageVO.of(page, RoomVO::from);
    }

    @Override
    public List<RoomVO> listAll(Integer status) {
        LambdaQueryWrapper<Room> wrapper = new LambdaQueryWrapper<Room>()
                .eq(status != null, Room::getStatus, status)
                .orderByAsc(Room::getFloor).orderByAsc(Room::getName);
        return roomMapper.selectList(wrapper).stream().map(RoomVO::from).collect(Collectors.toList());
    }

    @Override
    public RoomVO getById(Long id) {
        Room r = roomMapper.selectById(id);
        if (r == null) throw new BusinessException(ResultCode.ROOM_NOT_EXIST);
        return RoomVO.from(r);
    }

    @Override
    public RoomScheduleVO getSchedule(Long roomId, LocalDate date) {
        Room room = roomMapper.selectById(roomId);
        if (room == null) throw new BusinessException(ResultCode.ROOM_NOT_EXIST);
        LocalDate d = date != null ? date : LocalDate.now();
        LocalDateTime start = LocalDateTime.of(d, LocalTime.MIN);
        LocalDateTime end   = LocalDateTime.of(d, LocalTime.MAX);

        List<Reservation> reservations = reservationMapper.selectList(new LambdaQueryWrapper<Reservation>()
                .eq(Reservation::getRoomId, roomId)
                .in(Reservation::getStatus,
                        ReservationStatusEnum.APPROVED.getCode(),
                        ReservationStatusEnum.IN_PROGRESS.getCode(),
                        ReservationStatusEnum.PENDING_APPROVAL.getCode())
                .between(Reservation::getStartTime, start, end)
                .orderByAsc(Reservation::getStartTime));

        // 关联用户昵称
        Map<Long, String> nicknameMap = Collections.emptyMap();
        if (!reservations.isEmpty()) {
            List<Long> userIds = reservations.stream().map(Reservation::getUserId).distinct().toList();
            List<User> users = userMapper.selectByIds(userIds);
            nicknameMap = users.stream().collect(Collectors.toMap(User::getId, User::getNickname, (a, b) -> a));
        }

        Map<Long, String> finalNicknameMap = nicknameMap;
        List<RoomScheduleVO.Slot> slots = reservations.stream().map(r -> new RoomScheduleVO.Slot(
                r.getId(), r.getTitle(), finalNicknameMap.get(r.getUserId()),
                r.getStartTime(), r.getEndTime(),
                r.getStatus(), ReservationStatusEnum.descOf(r.getStatus())
        )).collect(Collectors.toList());

        return new RoomScheduleVO(room.getId(), room.getName(),
                d.format(DateTimeFormatter.ISO_LOCAL_DATE), slots);
    }

    /* ========== 管理员 ========== */

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create(RoomCreateDTO dto) {
        if (roomMapper.selectCount(new LambdaQueryWrapper<Room>().eq(Room::getName, dto.getName())) > 0) {
            throw new BusinessException(ResultCode.ROOM_NAME_EXIST);
        }
        Room r = new Room();
        r.setName(dto.getName());
        r.setFloor(dto.getFloor());
        r.setLocation(dto.getLocation());
        r.setCapacity(dto.getCapacity());
        r.setEquipment(dto.getEquipment());
        r.setDescription(dto.getDescription());
        r.setCoverImage(dto.getCoverImage());
        r.setNeedApproval(dto.getNeedApproval());
        r.setStatus(dto.getStatus() != null ? dto.getStatus() : RoomStatusEnum.AVAILABLE.getCode());
        roomMapper.insert(r);
        return r.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, RoomUpdateDTO dto) {
        Room exist = roomMapper.selectById(id);
        if (exist == null) throw new BusinessException(ResultCode.ROOM_NOT_EXIST);
        if (dto.getName() != null && !dto.getName().equals(exist.getName())) {
            if (roomMapper.selectCount(new LambdaQueryWrapper<Room>()
                    .eq(Room::getName, dto.getName()).ne(Room::getId, id)) > 0) {
                throw new BusinessException(ResultCode.ROOM_NAME_EXIST);
            }
        }
        Room r = new Room();
        r.setId(id);
        r.setName(dto.getName());
        r.setFloor(dto.getFloor());
        r.setLocation(dto.getLocation());
        r.setCapacity(dto.getCapacity());
        r.setEquipment(dto.getEquipment());
        r.setDescription(dto.getDescription());
        r.setCoverImage(dto.getCoverImage());
        r.setNeedApproval(dto.getNeedApproval());
        r.setStatus(dto.getStatus());
        roomMapper.updateById(r);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        Room exist = roomMapper.selectById(id);
        if (exist == null) throw new BusinessException(ResultCode.ROOM_NOT_EXIST);
        // 存在未完成的预约，禁止删除
        Long active = reservationMapper.selectCount(new LambdaQueryWrapper<Reservation>()
                .eq(Reservation::getRoomId, id)
                .in(Reservation::getStatus,
                        ReservationStatusEnum.PENDING_APPROVAL.getCode(),
                        ReservationStatusEnum.APPROVED.getCode(),
                        ReservationStatusEnum.IN_PROGRESS.getCode()));
        if (active != null && active > 0) {
            throw new BusinessException(ResultCode.ROOM_HAS_ACTIVE_RESERVATION);
        }
        roomMapper.deleteById(id);
    }
}
