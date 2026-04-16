package com.example.qlsv.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAttendanceStat {
    private String studentCode;
    private String studentName;

    // --- SỬA TỪ int SANG long ĐỂ KHỚP VỚI HÀM count() ---
    private long totalSessions;
    private long attendedSessions;
    private long absentSessions;
    // ----------------------------------------------------

    private double absentPercentage;
    private boolean isBanned;
}