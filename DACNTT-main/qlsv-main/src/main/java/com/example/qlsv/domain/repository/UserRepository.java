package com.example.qlsv.domain.repository;

import com.example.qlsv.domain.model.User;
import com.example.qlsv.domain.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    // Tìm theo mã riêng
    Optional<User> findByStudentCode(String studentCode);
    Optional<User> findByLecturerCode(String lecturerCode);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByStudentCode(String studentCode);
    boolean existsByLecturerCode(String studentCode);

    // Tìm user theo Role (ví dụ lấy list GV)
    List<User> findByRole(Role role);
}