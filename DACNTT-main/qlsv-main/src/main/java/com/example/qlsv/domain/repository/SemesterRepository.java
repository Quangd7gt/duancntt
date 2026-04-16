package com.example.qlsv.domain.repository;

import com.example.qlsv.domain.model.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {

    /**
     * Kiểm tra xem học kỳ đã tồn tại dựa trên Tên và Năm học
     */
    Optional<Semester> findByNameAndYear(String name, int year);

    /**
     * Kiểm tra khi cập nhật (trừ chính nó)
     */
    Optional<Semester> findByNameAndYearAndIdNot(String name, int year, Long id);
}