package com.example.qlsv.application.dto.mapper; // Đổi package cho đúng dự án của bạn

import com.example.qlsv.application.dto.response.LeaveRequestResponse;
import com.example.qlsv.domain.model.LeaveRequest;
import com.example.qlsv.domain.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface LeaveRequestMapper {

    // Map từ Entity sang DTO để trả về cho Client
    @Mapping(source = "student.studentCode", target = "studentCode")
    @Mapping(source = "course.subject.name", target = "courseName") // Lấy tên môn học
    @Mapping(source = "student", target = "studentName", qualifiedByName = "getFullName") // Ghép họ tên
    LeaveRequestResponse toResponse(LeaveRequest entity);

    // Hàm phụ trợ để ghép Họ + Tên
    @Named("getFullName")
    default String getFullName(User user) {
        if (user == null) return "";
        // Kiểm tra null để tránh lỗi nếu thiếu họ hoặc tên
        String lastName = user.getLastName() != null ? user.getLastName() : "";
        String firstName = user.getFirstName() != null ? user.getFirstName() : "";
        return (lastName + " " + firstName).trim();
    }
}