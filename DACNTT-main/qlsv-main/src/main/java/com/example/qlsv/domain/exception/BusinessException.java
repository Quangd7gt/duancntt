package com.example.qlsv.domain.exception; // (Gói của bạn có thể là com.example.qlsv...)

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception tùy chỉnh cho các lỗi quy tắc nghiệp vụ.
 * Khi ném (throw) exception này, nó sẽ được GlobalExceptionHandler bắt
 * và trả về một mã lỗi HTTP 400 (Bad Request) thay vì 500 (Internal Server Error).
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}