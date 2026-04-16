package com.example.qlsv.application.dto.mapper;
import com.example.qlsv.application.dto.mapper.SemesterMapper;
import com.example.qlsv.application.dto.mapper.SubjectMapper;
import com.example.qlsv.application.dto.response.CourseResponse;
import com.example.qlsv.domain.model.Course;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

// SỬA: Dùng UserMapper thay vì LecturerMapper
@Mapper(componentModel = "spring", uses = {SemesterMapper.class, SubjectMapper.class, UserMapper.class})
public interface CourseMapper {

    @Mapping(source = "subject", target = "subject") // Giữ nguyên
    @Mapping(source = "semester", target = "semester") // Giữ nguyên
    // SỬA: Map trường "lecturer" (User) bằng hàm "userToSimpleLecturerResponse" bên UserMapper
    @Mapping(source = "lecturers", target = "lecturers")
    CourseResponse toResponse(Course course);
}