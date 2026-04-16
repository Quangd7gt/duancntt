package com.example.qlsv.domain.repository;

import com.example.qlsv.domain.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    // Kiểm tra xem mã môn học đã tồn tại chưa
    Optional<Subject> findBySubjectCode(String subjectCode);

    // (Tùy chọn) Kiểm tra mã môn học tồn tại (trừ chính nó, dùng khi update)
    Optional<Subject> findBySubjectCodeAndIdNot(String subjectCode, Long id);
}