package com.example.qlsv.infrastructure.config;

import com.example.qlsv.domain.model.User;
import com.example.qlsv.domain.model.enums.Role;
import com.example.qlsv.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // Tạo Admin
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("123456"))
                    .email("admin@test.com")
                    .role(Role.ROLE_ADMIN)
                    .firstName("Super")
                    .lastName("Admin")
                    .enabled(true)
                    .build();
            userRepository.save(admin);

            // Tạo Giảng viên
            User lecturer = User.builder()
                    .username("gv.hung")
                    .password(passwordEncoder.encode("123456"))
                    .email("hung@test.com")
                    .role(Role.ROLE_LECTURER)
                    .firstName("Hung")
                    .lastName("Tran")
                    .lecturerCode("GV001")
                    .department("CNTT")
                    .enabled(true)
                    .build();
            userRepository.save(lecturer);

            // Tạo Sinh viên
            User student = User.builder()
                    .username("sv.nam")
                    .password(passwordEncoder.encode("123456"))
                    .email("nam@test.com")
                    .role(Role.ROLE_STUDENT)
                    .firstName("Nam")
                    .lastName("Nguyen")
                    .studentCode("SV001")
                    .enabled(true)
                    .build();
            userRepository.save(student);

            System.out.println("--- ĐÃ KHỞI TẠO DỮ LIỆU MẪU THÀNH CÔNG ---");
        }
    }
}