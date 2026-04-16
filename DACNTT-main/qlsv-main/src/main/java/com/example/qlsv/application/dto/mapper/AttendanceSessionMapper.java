package com.example.qlsv.application.dto.mapper;

import com.example.qlsv.application.dto.response.AttendanceSessionResponse;
import com.example.qlsv.domain.model.AttendanceSession;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AttendanceSessionMapper {

    @Mapping(source = "id", target = "sessionId")
    @Mapping(source = "course.id", target = "courseId")
    @Mapping(source = "course.subject.name", target = "courseName")
    @Mapping(source = "qrCodeData", target = "qrCodeData")
    AttendanceSessionResponse toResponse(AttendanceSession session);
}