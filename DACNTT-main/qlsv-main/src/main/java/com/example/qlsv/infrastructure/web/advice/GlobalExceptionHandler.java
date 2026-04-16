package com.example.qlsv.infrastructure.web.advice;

import com.example.qlsv.domain.exception.BusinessException;
import com.example.qlsv.domain.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError; // <-- Import này quan trọng
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    public static class ErrorResponse {
        public int statusCode;
        public LocalDateTime timestamp;
        public String message;
        public String path;
        public Object details;

        public ErrorResponse(HttpStatus status, String message, String path, Object details) {
            this.statusCode = status.value();
            this.timestamp = LocalDateTime.now();
            this.message = message;
            this.path = path;
            this.details = details;
        }
    }

    // Xử lý BusinessException (Logic nghiệp vụ)
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex, WebRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                request.getDescription(false).replace("uri=", ""),
                null
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // Xử lý ResourceNotFoundException (Không tìm thấy)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                request.getDescription(false).replace("uri=", ""),
                null
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    // --- [SỬA LẠI ĐOẠN NÀY ĐỂ FRONTEND BẮT ĐƯỢC MESSAGE] ---
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex, WebRequest request) {

        // 1. Tạo một list để chứa các thông báo lỗi chi tiết
        List<String> details = new ArrayList<>();

        // 2. Duyệt qua từng lỗi và format lại chuỗi thông báo
        // Ví dụ: "username: vui lòng điền username..."
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            details.add(fieldName + ": " + errorMessage);
        });

        // 3. Nối tất cả lỗi thành 1 chuỗi duy nhất, ngăn cách bằng xuống dòng (\n)
        // Ví dụ: "username: lỗi A \n password: lỗi B"
        String mainMessage = String.join("\n", details);

        // 4. Trả về response
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST,
                mainMessage, // Frontend sẽ nhận được chuỗi chứa TOÀN BỘ lỗi
                request.getDescription(false).replace("uri=", ""),
                details // (Optional) Gửi kèm list gốc nếu frontend muốn xử lý nâng cao
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
    // -------------------------------------------------------

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ex.getMessage(), // Trong dev thì để ex.getMessage(), prod thì nên giấu đi
                request.getDescription(false).replace("uri=", ""),
                null
        );
        ex.printStackTrace();
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}