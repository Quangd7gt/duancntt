package com.example.qlsv.domain.model;

import com.example.qlsv.domain.model.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_user_student_code", columnList = "studentCode"),
        @Index(name = "idx_user_lecturer_code", columnList = "lecturerCode")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    private Role role;

    // --- CÁC TRƯỜNG GỘP TỪ STUDENT VÀ LECTURER ---

    private String firstName;
    private String lastName;

    // Chỉ dành cho Role = STUDENT, các role khác để null
    @Column(unique = true)
    private String studentCode;

    // Chỉ dành cho Role = LECTURER, các role khác để null
    @Column(unique = true)
    private String lecturerCode;

    // Dành cho Lecturer
    private String department;
    @Builder.Default
    private boolean enabled = true;
}