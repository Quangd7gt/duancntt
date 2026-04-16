package com.example.qlsv.application.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class CourseDashboardResponse {
    // Thuộc tính bạn muốn thêm
    private int totalBanned;

    // Danh sách sinh viên chi tiết (cũ)
    private List<StudentAttendanceStat> studentDetails;
}