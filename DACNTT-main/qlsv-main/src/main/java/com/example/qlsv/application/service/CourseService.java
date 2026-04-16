package com.example.qlsv.application.service;

import com.example.qlsv.application.dto.request.CreateCourseRequest;
import com.example.qlsv.application.dto.response.CourseDashboardResponse;
import com.example.qlsv.application.dto.response.CourseResponse;
import com.example.qlsv.application.dto.response.SimpleStudentResponse;
import com.example.qlsv.application.dto.response.StudentAttendanceStat;

import java.io.ByteArrayInputStream;
import java.util.List;

public interface CourseService {
    CourseResponse createCourse(CreateCourseRequest request);
    void registerStudentToCourse(String studentCode, Long courseId);
    List<CourseResponse> getAllCourses();
    CourseResponse getCourseById(Long id);
    void deleteCourse(Long id);

    List<CourseResponse> getCoursesByLecturer(Long userId);

    // [FIX 6] Tên hàm chuẩn
    List<SimpleStudentResponse> getStudentsByCourse(Long courseId);

    CourseDashboardResponse getCourseStatistics(Long courseId);
    void sendBanNotifications(Long courseId);
    ByteArrayInputStream exportCourseStatsToExcel(Long courseId);
}