package com.example.qlsv.infrastructure.web.controller;

import com.example.qlsv.application.dto.mapper.CourseMapper;
import com.example.qlsv.application.dto.request.CreateCourseRequest;
import com.example.qlsv.application.dto.request.RegisterStudentRequest;
import com.example.qlsv.application.dto.response.CourseDashboardResponse;
import com.example.qlsv.application.dto.response.CourseResponse;
import com.example.qlsv.application.dto.response.SimpleStudentResponse;
import com.example.qlsv.application.service.CourseService;
import com.example.qlsv.domain.model.Course;
import com.example.qlsv.domain.repository.CourseRepository;
import com.example.qlsv.infrastructure.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;

    @PostMapping
    // Thư ký và Admin được tạo lớp học phần
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARY')")
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CreateCourseRequest request) {
        return new ResponseEntity<>(courseService.createCourse(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARY', 'LECTURER', 'STUDENT')")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARY')")
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Xóa lớp vẫn nên để Admin
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/register-student")
    // Thư ký và Admin được ghi danh
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARY')")
    public ResponseEntity<Void> registerStudentToCourse(@Valid @RequestBody RegisterStudentRequest request) {
        courseService.registerStudentToCourse(request.getStudentCode(), request.getCourseId());
        return ResponseEntity.ok().build();
    }
    @GetMapping("/my-courses")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CourseResponse>> getMyCourses(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long studentId = userDetails.getUser().getId();
        List<Course> courses = courseRepository.findByStudents_Id(studentId);
        // Convert to DTO using Mapper
        return ResponseEntity.ok(courses.stream()
                .map(courseMapper::toResponse)
                .collect(Collectors.toList()));
    }

    // Các API khác giữ nguyên, chỉ cần update @PreAuthorize nếu cần SECRETARY xem
    @GetMapping("/{id}/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARY', 'LECTURER')")
    public ResponseEntity<List<SimpleStudentResponse>> getStudentsInCourse(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getStudentsByCourse(id));
    }

    @GetMapping("/by-lecturer/{lecturerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARY', 'LECTURER')")
    public ResponseEntity<List<CourseResponse>> getCoursesByLecturer(@PathVariable Long lecturerId) {
        return ResponseEntity.ok(courseService.getCoursesByLecturer(lecturerId));
    }


    @GetMapping("/{id}/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARY', 'LECTURER')")
    public ResponseEntity<CourseDashboardResponse> getCourseStats(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseStatistics(id));
    }

    @PostMapping("/{id}/send-ban-notifications")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECRETARY', 'LECTURER')")
    public ResponseEntity<String> sendBanNotifications(@PathVariable Long id) {
        courseService.sendBanNotifications(id);
        return ResponseEntity.ok("Đã gửi lệnh gửi email.");
    }
    @GetMapping("/{id}/export-excel")
    //@PreAuthorize("hasAnyRole('ADMIN', 'LECTURER', 'SECRETARY')")
    public ResponseEntity<InputStreamResource> exportExcel(@PathVariable Long id) {
        ByteArrayInputStream in = courseService.exportCourseStatsToExcel(id);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=thong_ke_lop_" + id + ".xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }
}