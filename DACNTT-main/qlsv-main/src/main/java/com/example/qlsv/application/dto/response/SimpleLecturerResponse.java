package com.example.qlsv.application.dto.response;

import lombok.Data;

@Data
public class SimpleLecturerResponse {
    private Long id;
    private String lecturerCode;
    private String firstName;
    private String lastName;
    private String department;
}