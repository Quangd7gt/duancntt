package com.example.qlsv.application.dto.response;

import lombok.Data;

@Data
public class SimpleStudentResponse {
    private Long id;
    private String studentCode;
    private String firstName;
    private String lastName;
    private String email;
}