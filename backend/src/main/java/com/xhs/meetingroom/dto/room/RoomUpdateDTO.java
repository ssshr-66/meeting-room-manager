package com.xhs.meetingroom.dto.room;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RoomUpdateDTO {

    @Size(max = 64)
    private String name;
    private String floor;
    private String location;

    @Min(1) @Max(500)
    private Integer capacity;

    private String equipment;
    private String description;
    private String coverImage;
    private Integer needApproval;
    private Integer status;
}
