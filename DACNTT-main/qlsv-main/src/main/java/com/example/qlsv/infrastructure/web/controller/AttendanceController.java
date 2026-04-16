package com.example.qlsv.infrastructure.web.controller;

import com.example.qlsv.application.dto.request.StartSessionRequest;
import com.example.qlsv.application.dto.request.StudentCheckInRequest;
import com.example.qlsv.application.dto.response.AttendanceRecordResponse;
import com.example.qlsv.application.dto.response.AttendanceSessionResponse;
import com.example.qlsv.application.dto.response.CheckInResponse;
import com.example.qlsv.application.dto.response.StudentHistoryResponse;
import com.example.qlsv.application.service.AttendanceService;
import com.example.qlsv.domain.model.User;
import com.example.qlsv.domain.model.enums.AttendanceStatus;
import com.example.qlsv.infrastructure.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/start-session")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<AttendanceSessionResponse> startSession(
            @Valid @RequestBody StartSessionRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(attendanceService.startSession(request, currentUser.getUser().getId()));
    }

    @PostMapping("/close-session")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<AttendanceSessionResponse> closeSession(
            @Valid @RequestBody StartSessionRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        AttendanceSessionResponse response = attendanceService.closeSession(request.getCourseId(), currentUser.getUser().getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/check-in")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CheckInResponse> checkIn(
            @Valid @RequestBody StudentCheckInRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        return ResponseEntity.ok(attendanceService.studentCheckIn(request, currentUser.getUser().getId()));
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARY', 'LECTURER', 'STUDENT')")
    public ResponseEntity<List<AttendanceSessionResponse>> getSessionsByCourse(@PathVariable Long courseId) {
        List<AttendanceSessionResponse> sessions = attendanceService.getSessionsByCourse(courseId);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/history/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<StudentHistoryResponse>> getMyHistory(
            @PathVariable Long courseId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        // Sửa lỗi ở đây: Lấy thẳng studentCode từ User
        return ResponseEntity.ok(attendanceService.getStudentHistory(courseId, currentUser.getUser().getStudentCode()));
    }

    @GetMapping("/session/{sessionId}/records")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARY', 'LECTURER')")
    public ResponseEntity<List<AttendanceRecordResponse>> getRecordsBySession(@PathVariable Long sessionId) {
        List<AttendanceRecordResponse> records = attendanceService.getRecordsBySession(sessionId);
        return ResponseEntity.ok(records);
    }

    @PutMapping("/record/{recordId}")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN')")
    public ResponseEntity<Void> updateRecordStatus(@PathVariable Long recordId, @RequestBody UpdateStatusRequest request) {
        attendanceService.updateRecordStatus(recordId, AttendanceStatus.valueOf(request.getStatus()));
        return ResponseEntity.ok().build();
    }

    @Data
    public static class UpdateStatusRequest {
        private String status;
    }
}