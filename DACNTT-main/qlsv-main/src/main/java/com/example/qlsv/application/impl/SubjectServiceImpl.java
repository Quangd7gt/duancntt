package com.example.qlsv.application.impl;

import com.example.qlsv.application.dto.SubjectDTO;
import com.example.qlsv.application.dto.mapper.SubjectMapper;
import com.example.qlsv.application.service.SubjectService;
import com.example.qlsv.domain.exception.BusinessException;
import com.example.qlsv.domain.exception.ResourceNotFoundException;
import com.example.qlsv.domain.model.Subject;
import com.example.qlsv.domain.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;
    private final SubjectMapper subjectMapper;

    @Override
    @Transactional
    public SubjectDTO createSubject(SubjectDTO subjectDTO) {
        // 1. Kiểm tra nghiệp vụ: Mã môn học có bị trùng không?
        subjectRepository.findBySubjectCode(subjectDTO.getSubjectCode())
                .ifPresent(s -> {
                    throw new BusinessException("Mã môn học đã tồn tại: " + s.getSubjectCode());
                });

        // 2. Chuyển DTO sang Entity
        Subject newSubject = subjectMapper.toEntity(subjectDTO);

        // 3. Lưu vào DB
        Subject savedSubject = subjectRepository.save(newSubject);

        // 4. Chuyển Entity đã lưu (có ID) sang DTO để trả về
        return subjectMapper.toDTO(savedSubject);
    }

    @Override
    @Transactional(readOnly = true)
    public SubjectDTO getSubjectById(Long id) {
        // 1. Tìm entity
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));

        // 2. Map sang DTO
        return subjectMapper.toDTO(subject);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectDTO> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(subjectMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SubjectDTO updateSubject(Long id, SubjectDTO subjectDTO) {
        // 1. Tìm entity cũ
        Subject existingSubject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", id));

        // 2. Kiểm tra nghiệp vụ: Nếu đổi mã môn học, mã mới có bị trùng với cái khác không?
        subjectRepository.findBySubjectCodeAndIdNot(subjectDTO.getSubjectCode(), id)
                .ifPresent(s -> {
                    throw new BusinessException("Mã môn học đã tồn tại: " + s.getSubjectCode());
                });

        // 3. Cập nhật entity cũ từ DTO
        subjectMapper.updateEntityFromDto(subjectDTO, existingSubject);

        // 4. Lưu lại (JPA sẽ tự động merge)
        Subject updatedSubject = subjectRepository.save(existingSubject);

        // 5. Trả về DTO
        return subjectMapper.toDTO(updatedSubject);
    }

    @Override
    @Transactional
    public void deleteSubject(Long id) {
        // 1. Kiểm tra tồn tại
        if (!subjectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Subject", "id", id);
        }

        // (Trong dự án thật, bạn cần kiểm tra xem Môn học này có đang
        // được sử dụng trong Lớp học phần (Course) nào không trước khi xóa)
        // Ví dụ: if (courseRepository.existsBySubjectId(id)) { ... }

        // 2. Xóa
        subjectRepository.deleteById(id);
    }
}