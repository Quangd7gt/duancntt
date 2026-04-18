package com.example.qlsv.domain.exception;

/**
 * Ngoại lệ liên quan đến nghiệp vụ kiểm tra khoảng cách GPS.
 * Thuộc tầng Domain theo Clean Architecture.
 */
public class GpsException extends RuntimeException {
    public GpsException(String message) {
        super(message);
    }
}
