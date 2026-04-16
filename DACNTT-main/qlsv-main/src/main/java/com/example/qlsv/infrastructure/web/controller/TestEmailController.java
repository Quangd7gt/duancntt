package com.example.qlsv.infrastructure.web.controller;

import com.example.qlsv.infrastructure.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/test-email")
@RequiredArgsConstructor
public class TestEmailController {

    private final EmailService emailService;

    // API này ai gọi cũng được (để test cho nhanh)
    @PostMapping
    public ResponseEntity<String> sendTestEmail(@RequestParam String emailNhan) {

        System.out.println("--- Đang thử gửi email tới: " + emailNhan + " ---");

        // Gọi hàm gửi mail có sẵn trong Service của chúng ta


        return ResponseEntity.ok("Đã gửi lệnh gửi mail. Hãy kiểm tra Console và Hộp thư đến (hoặc Spam).");
    }
}