package com.example.qlsv.infrastructure.web.controller;

import com.example.qlsv.application.dto.request.CreateLeaveRequest;
import com.example.qlsv.application.dto.request.UpdateLeaveStatusRequest;
import com.example.qlsv.application.dto.response.LeaveRequestResponse;
import com.example.qlsv.application.service.LeaveRequestService;
import com.example.qlsv.infrastructure.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leave-requests")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    // 1. Sinh viên tạo đơn
    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<LeaveRequestResponse> createRequest(
            @RequestBody @Valid CreateLeaveRequest request,
            @AuthenticationPrincipal UserDetails userDetails) { // Lấy user hiện tại
        // Giả sử UserDetails có chứa ID, hoặc bạn query lại user từ username
        Long userId = ((CustomUserDetails) userDetails).getUser().getId();
        return ResponseEntity.ok(leaveRequestService.createRequest(request, userId));
    }

    // 2. Sinh viên xem lịch sử đơn
    @GetMapping("/my-history")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<LeaveRequestResponse>> getMyHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(leaveRequestService.getMyRequests(userDetails.getUser().getId()));
    }

    // 3. Giảng viên xem đơn theo Course ID
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<List<LeaveRequestResponse>> getByCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(leaveRequestService.getRequestsByCourse(courseId, userDetails.getUser().getId()));
    }

    // 4. Giảng viên duyệt đơn
    @PatchMapping("/{requestId}/status")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<LeaveRequestResponse> updateStatus(
            @PathVariable Long requestId,
            @RequestBody UpdateLeaveStatusRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(leaveRequestService.updateStatus(requestId, request, userDetails.getUser().getId()));
    }
}
