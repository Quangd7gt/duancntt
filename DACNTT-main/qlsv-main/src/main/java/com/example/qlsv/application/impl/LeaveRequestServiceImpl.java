package com.example.qlsv.application.impl;

import com.example.qlsv.application.dto.mapper.LeaveRequestMapper;
import com.example.qlsv.application.dto.request.CreateLeaveRequest;
import com.example.qlsv.application.dto.request.UpdateLeaveStatusRequest;
import com.example.qlsv.application.dto.response.LeaveRequestResponse;
import com.example.qlsv.application.service.LeaveRequestService;
import com.example.qlsv.domain.exception.BusinessException;
import com.example.qlsv.domain.exception.ResourceNotFoundException;
import com.example.qlsv.domain.model.Course;
import com.example.qlsv.domain.model.LeaveRequest;
import com.example.qlsv.domain.model.User;
import com.example.qlsv.domain.model.enums.LeaveRequestStatus;
import com.example.qlsv.domain.repository.CourseRepository;
import com.example.qlsv.domain.repository.LeaveRequestRepository;
import com.example.qlsv.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final LeaveRequestMapper leaveRequestMapper;

    @Override
    @Transactional
    public LeaveRequestResponse createRequest(CreateLeaveRequest request, Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        // Validate: Sinh viên phải thuộc lớp này mới được xin nghỉ
        boolean isEnrolled = course.getStudents().stream()
                .anyMatch(s -> s.getId().equals(studentId));
        if (!isEnrolled) {
            throw new BusinessException("Bạn không phải là thành viên của lớp học phần này.");
        }

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .student(student)
                .course(course)
                .requestDate(request.getRequestDate())
                .reason(request.getReason())
                .type(request.getType())
                .status(LeaveRequestStatus.PENDING)
                .build();

        return leaveRequestMapper.toResponse(leaveRequestRepository.save(leaveRequest));
    }

    @Override
    public List<LeaveRequestResponse> getMyRequests(Long studentId) {
        return leaveRequestRepository.findByStudent_IdOrderByCreatedAtDesc(studentId)
                .stream().map(leaveRequestMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<LeaveRequestResponse> getRequestsByCourse(Long courseId, Long lecturerId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        // Validate: Chỉ giảng viên của lớp này mới được xem
        boolean isLecturer = course.getLecturers().stream()
                .anyMatch(l -> l.getId().equals(lecturerId));
        if (!isLecturer) {
            throw new BusinessException("Bạn không phải là giảng viên của lớp này.");
        }

        return leaveRequestRepository.findByCourse_IdOrderByCreatedAtDesc(courseId)
                .stream().map(leaveRequestMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LeaveRequestResponse updateStatus(Long requestId, UpdateLeaveStatusRequest request, Long lecturerId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        // Validate: Giảng viên duyệt phải dạy lớp này
        boolean isLecturer = leaveRequest.getCourse().getLecturers().stream()
                .anyMatch(l -> l.getId().equals(lecturerId));
        if (!isLecturer) {
            throw new BusinessException("Bạn không có quyền duyệt đơn này.");
        }

        leaveRequest.setStatus(request.getStatus());


        return leaveRequestMapper.toResponse(leaveRequestRepository.save(leaveRequest));
    }
}
