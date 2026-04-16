package com.example.qlsv.application.service;

import com.example.qlsv.application.dto.SubjectDTO;
import java.util.List;

public interface SubjectService {

    SubjectDTO createSubject(SubjectDTO subjectDTO);

    SubjectDTO getSubjectById(Long id);

    List<SubjectDTO> getAllSubjects();

    SubjectDTO updateSubject(Long id, SubjectDTO subjectDTO);

    void deleteSubject(Long id);
}