package com.example.qlsv.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Value Object đại diện cho tọa độ địa lý.
 * Thuộc tầng Domain, không mang dependency của Spring.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {
    private Double latitude;
    private Double longitude;

    public boolean isValid() {
        return latitude != null && longitude != null;
    }
}
