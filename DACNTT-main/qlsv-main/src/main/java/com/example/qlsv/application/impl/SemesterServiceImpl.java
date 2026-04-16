package com.example.qlsv.application.impl;

import com.example.qlsv.application.dto.SemesterDTO;
import com.example.qlsv.application.dto.mapper.SemesterMapper;
import com.example.qlsv.application.service.SemesterService;
import com.example.qlsv.domain.exception.BusinessException;
import com.example.qlsv.domain.exception.ResourceNotFoundException;
import com.example.qlsv.domain.model.Semester;
import com.example.qlsv.domain.repository.CourseRepository; // Cần để kiểm tra xóa
import com.example.qlsv.domain.repository.SemesterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SemesterServiceImpl implements SemesterService {

    private final SemesterRepository semesterRepository;
    private final SemesterMapper semesterMapper;

    // (Giả sử bạn đã có CourseRepository)
    // private final CourseRepository courseRepository;

    @Override
    @Transactional
    public SemesterDTO createSemester(SemesterDTO semesterDTO) {
        // 1. Kiểm tra nghiệp vụ: Tên và Năm có bị trùng không?
        semesterRepository.findByNameAndYear(semesterDTO.getName(), semesterDTO.getYear())
                .ifPresent(s -> {
                    throw new BusinessException("Học kỳ đã tồn tại: " + s.getName() + " - " + s.getYear());
                });

        // 2. Chuyển DTO sang Entity
        Semester newSemester = semesterMapper.toEntity(semesterDTO);

        // 3. Lưu
        Semester savedSemester = semesterRepository.save(newSemester);

        // 4. Trả về DTO
        return semesterMapper.toDTO(savedSemester);
    }

    @Override
    @Transactional(readOnly = true)
    public SemesterDTO getSemesterById(Long id) {
        Semester semester = semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semester", "id", id));

        return semesterMapper.toDTO(semester);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SemesterDTO> getAllSemesters() {
        return semesterRepository.findAll().stream()
                .map(semesterMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SemesterDTO updateSemester(Long id, SemesterDTO semesterDTO) {
        // 1. Tìm entity cũ
        Semester existingSemester = semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semester", "id", id));

        // 2. Kiểm tra nghiệp vụ: Nếu đổi Tên/Năm, có bị trùng với cái khác không?
        semesterRepository.findByNameAndYearAndIdNot(semesterDTO.getName(), semesterDTO.getYear(), id)
                .ifPresent(s -> {
                    throw new BusinessException("Học kỳ đã tồn tại: " + s.getName() + " - " + s.getYear());
                });

        // 3. Cập nhật entity cũ từ DTO
        semesterMapper.updateEntityFromDto(semesterDTO, existingSemester);

        // 4. Lưu lại
        Semester updatedSemester = semesterRepository.save(existingSemester);

        // 5. Trả về DTO
        return semesterMapper.toDTO(updatedSemester);
    }

    @Override
    @Transactional
    public void deleteSemester(Long id) {
        // 1. Kiểm tra tồn tại
        if (!semesterRepository.existsById(id)) {
            throw new ResourceNotFoundException("Semester", "id", id);
        }

        // 2. [QUAN TRỌNG] Kiểm tra xem học kỳ có đang được sử dụng không
        // (Bỏ comment khi bạn đã có CourseRepository và phương thức existsBySemesterId)
        /* if (courseRepository.existsBySemesterId(id)) {
            throw new BusinessException("Không thể xóa học kỳ đang được sử dụng bởi một Lớp học phần.");
        }
        */

        // 3. Xóa
        semesterRepository.deleteById(id);
    }
}