package com.example.qlsv.application.service;

import com.example.qlsv.application.dto.request.CreateLeaveRequest;
import com.example.qlsv.application.dto.request.UpdateLeaveStatusRequest;
import com.example.qlsv.application.dto.response.LeaveRequestResponse;

import java.util.List;

public interface LeaveRequestService {
    // Sinh viên tạo đơn
    LeaveRequestResponse createRequest(CreateLeaveRequest request, Long studentId);

    // Sinh viên xem lịch sử đơn
    List<LeaveRequestResponse> getMyRequests(Long studentId);

    // Giảng viên xem đơn của lớp mình dạy
    List<LeaveRequestResponse> getRequestsByCourse(Long courseId, Long lecturerId);

    // Giảng viên duyệt đơn
    LeaveRequestResponse updateStatus(Long requestId, UpdateLeaveStatusRequest request, Long lecturerId);
}