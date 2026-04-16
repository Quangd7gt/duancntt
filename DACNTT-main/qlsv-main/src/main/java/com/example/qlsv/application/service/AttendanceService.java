package com.example.qlsv.application.service;

import com.example.qlsv.application.dto.request.StartSessionRequest;
import com.example.qlsv.application.dto.request.StudentCheckInRequest; // <-- MỚI
import com.example.qlsv.application.dto.response.AttendanceRecordResponse;
import com.example.qlsv.application.dto.response.AttendanceSessionResponse;
import com.example.qlsv.application.dto.response.CheckInResponse; // <-- MỚI
import com.example.qlsv.application.dto.response.StudentHistoryResponse;
import com.example.qlsv.domain.model.enums.AttendanceStatus;

import java.util.List;

public interface AttendanceService {

    // (Hàm cũ của Giảng viên)
    AttendanceSessionResponse startSession(StartSessionRequest request, Long lecturerId);

    // --- [MỚI] HÀM CỦA SINH VIÊN ---
    AttendanceSessionResponse closeSession(Long courseId, Long userId);
    CheckInResponse studentCheckIn(StudentCheckInRequest request, Long studentId);
    List<AttendanceSessionResponse> getSessionsByCourse(Long courseId);
    public List<StudentHistoryResponse> getStudentHistory(Long courseId, String studentCode);
    void updateRecordStatus(Long recordId, AttendanceStatus status);
    List<AttendanceRecordResponse> getRecordsBySession(Long sessionId);
}