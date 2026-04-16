package com.example.qlsv.application.dto.mapper;

import com.example.qlsv.application.dto.SemesterDTO;
import com.example.qlsv.domain.model.Semester;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SemesterMapper {

    // Chuyển DTO sang Entity (dùng khi Create)
    Semester toEntity(SemesterDTO dto);

    // Chuyển Entity sang DTO (dùng khi Get)
    SemesterDTO toDTO(Semester entity);

    /**
     * Cập nhật một entity đã tồn tại từ DTO (dùng khi Update)
     */
    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(SemesterDTO dto, @MappingTarget Semester entity);
}