package com.example.qlsv.application.dto.mapper;

import com.example.qlsv.application.dto.SubjectDTO;
import com.example.qlsv.domain.model.Subject;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget; // Dùng để update

@Mapper(componentModel = "spring")
public interface SubjectMapper {

    // Chuyển DTO sang Entity (dùng khi Create)
    Subject toEntity(SubjectDTO dto);

    // Chuyển Entity sang DTO (dùng khi Get)
    SubjectDTO toDTO(Subject entity);

    /**
     * Cập nhật một entity đã tồn tại từ DTO (dùng khi Update)
     * @param dto Dữ liệu mới từ request
     * @param entity Đối tượng Subject đã được lấy từ DB
     */
    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(SubjectDTO dto, @MappingTarget Subject entity);
}