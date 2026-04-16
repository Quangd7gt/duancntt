package com.example.qlsv.application.service;

import com.example.qlsv.application.dto.SemesterDTO;
import java.util.List;

public interface SemesterService {

    SemesterDTO createSemester(SemesterDTO semesterDTO);

    SemesterDTO getSemesterById(Long id);

    List<SemesterDTO> getAllSemesters();

    SemesterDTO updateSemester(Long id, SemesterDTO semesterDTO);

    void deleteSemester(Long id);
}