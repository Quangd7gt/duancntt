package com.example.qlsv.domain.model;
// Tự tạo enum hoặc dùng java.time.DayOfWeek
import jakarta.persistence.*;
import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "courses", indexes = {
        @Index(name = "idx_course_semester", columnList = "semester_id"),
        @Index(name = "idx_course_code", columnList = "courseCode") // Tìm theo mã lớp học phần
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String courseCode;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @ManyToOne
    @JoinColumn(name = "semester_id")
    private Semester semester;

    // --- THAY ĐỔI: Trỏ tới User (Role phải là LECTURER) ---
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "course_lecturers", // Tên bảng trung gian mới sẽ được tạo
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "lecturer_user_id")
    )
    @Builder.Default
    private Set<User> lecturers = new HashSet<>();

    // --- THAY ĐỔI: Danh sách User (Role phải là STUDENT) ---
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "course_registrations",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "student_user_id")
    )
    @Builder.Default
    private Set<User> students = new HashSet<>();

    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;

    private LocalTime startTime;
    private LocalTime endTime;
}