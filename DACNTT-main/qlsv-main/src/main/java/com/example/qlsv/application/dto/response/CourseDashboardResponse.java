package com.example.qlsv.application.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class CourseDashboardResponse {
    private int totalBanned;
    private long totalSessions;
    private int totalStudents;

    private List<StudentAttendanceStat> studentDetails;
}