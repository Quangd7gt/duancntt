package com.example.qlsv.application.dto.response;
import com.example.qlsv.application.dto.SemesterDTO;
import com.example.qlsv.application.dto.SubjectDTO;
import lombok.Data;

import java.time.DayOfWeek; // <-- MỚI
import java.time.LocalTime; // <-- MỚI
import java.util.Set;

@Data
public class CourseResponse {

    private Long id;
    private String courseCode;

    private SubjectDTO subject;
    private SemesterDTO semester;
    private Set<SimpleLecturerResponse> lecturers;

    // --- [MỚI] HIỂN THỊ LỊCH HỌC ---
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
}