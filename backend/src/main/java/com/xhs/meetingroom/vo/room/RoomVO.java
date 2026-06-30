package com.xhs.meetingroom.vo.room;

import com.xhs.meetingroom.entity.Room;
import com.xhs.meetingroom.enums.RoomStatusEnum;
import lombok.Data;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class RoomVO {

    private Long id;
    private String name;
    private String floor;
    private String location;
    private Integer capacity;
    private String equipment;
    private List<String> equipmentList;
    private String description;
    private String coverImage;
    private Integer needApproval;
    private Integer status;
    private String statusDesc;

    public static RoomVO from(Room r) {
        if (r == null) return null;
        RoomVO vo = new RoomVO();
        vo.setId(r.getId());
        vo.setName(r.getName());
        vo.setFloor(r.getFloor());
        vo.setLocation(r.getLocation());
        vo.setCapacity(r.getCapacity());
        vo.setEquipment(r.getEquipment());
        vo.setEquipmentList(splitEquipment(r.getEquipment()));
        vo.setDescription(r.getDescription());
        vo.setCoverImage(r.getCoverImage());
        vo.setNeedApproval(r.getNeedApproval());
        vo.setStatus(r.getStatus());
        vo.setStatusDesc(RoomStatusEnum.descOf(r.getStatus()));
        return vo;
    }

    private static List<String> splitEquipment(String s) {
        if (s == null || s.isBlank()) return Collections.emptyList();
        return Arrays.stream(s.split("[,，]"))
                .map(String::trim)
                .filter(x -> !x.isEmpty())
                .collect(Collectors.toList());
    }
}
