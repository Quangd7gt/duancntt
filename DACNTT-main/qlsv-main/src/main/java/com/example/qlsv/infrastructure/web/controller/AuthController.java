package com.example.qlsv.infrastructure.web.controller;

import com.example.qlsv.application.dto.request.LoginRequest;
import com.example.qlsv.application.dto.request.RegisterStudentRequest;
import com.example.qlsv.application.dto.response.JwtAuthResponse;
import com.example.qlsv.application.service.UserService;
import com.example.qlsv.domain.model.User;
import com.example.qlsv.infrastructure.security.CustomUserDetails;
import com.example.qlsv.infrastructure.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor

public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserService userService; // (Nếu bạn có dùng service đăng ký)

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // 1. Xác thực username/password
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        // 2. Lưu vào Context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. Tạo Token
        String jwt = tokenProvider.generateToken(authentication);

        // [SỬA LỖI Ở ĐÂY]: Ép kiểu về CustomUserDetails trước, sau đó mới lấy User
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        // 4. Trả về Response
        return ResponseEntity.ok(new JwtAuthResponse(
                jwt,                    // 1. accessToken
                "Bearer",               // 2. tokenType
                user.getId(),           // 3. userId
                user.getUsername(),     // 4. username
                user.getEmail(),        // 5. email
                user.getRole().name()   // 6. role
        ));
    }

    // Nếu bạn có hàm register thì giữ nguyên, hoặc copy lại nếu cần
    // @PostMapping("/register-student") ...
}