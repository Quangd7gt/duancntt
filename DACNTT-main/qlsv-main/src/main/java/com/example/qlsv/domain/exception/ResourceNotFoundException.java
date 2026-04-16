package com.example.qlsv.domain.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        // Ví dụ: "Không tìm thấy Môn học với ID : 1"
        super(String.format("Không tìm thấy %s với %s : '%s'", resourceName, fieldName, fieldValue));
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}