package com.example.qlsv.application.impl;

import com.example.qlsv.application.dto.mapper.UserMapper;
import com.example.qlsv.application.dto.request.CreateUserRequest;
import com.example.qlsv.application.dto.request.UpdateUserRequest;
import com.example.qlsv.application.dto.response.UserResponse;
import com.example.qlsv.application.service.UserService;
import com.example.qlsv.domain.exception.BusinessException;
import com.example.qlsv.domain.exception.ResourceNotFoundException;
import com.example.qlsv.domain.model.User;
import com.example.qlsv.domain.model.enums.Role;
import com.example.qlsv.domain.repository.UserRepository;
import com.example.qlsv.infrastructure.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        // 1. Validate chung
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Username đã tồn tại: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email đã tồn tại: " + request.getEmail());
        }

        Role role;
        try {
            role = Role.valueOf("ROLE_" + request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Vai trò không hợp lệ: " + request.getRole());
        }

        // 2. Khởi tạo User
        User.UserBuilder userBuilder = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role(role)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .enabled(true);

        // 3. Xử lý logic riêng theo Role
        if (role == Role.ROLE_STUDENT) {
            if (request.getStudentCode() == null || request.getStudentCode().isBlank()) {
                throw new BusinessException("Mã sinh viên không được để trống");
            }
            if (userRepository.existsByStudentCode(request.getStudentCode())) {
                throw new BusinessException("Mã sinh viên đã tồn tại: " + request.getStudentCode());
            }
            userBuilder.studentCode(request.getStudentCode());

        } else if (role == Role.ROLE_LECTURER) {
            if (request.getLecturerCode() == null || request.getLecturerCode().isBlank()) {
                throw new BusinessException("Mã giảng viên không được để trống");
            }
            if (userRepository.existsByLecturerCode(request.getLecturerCode())) {
                throw new BusinessException("Mã giảng viên đã tồn tại: " + request.getLecturerCode());
            }
            userBuilder.lecturerCode(request.getLecturerCode());
            userBuilder.department(request.getDepartment());
        }

        // 4. Lưu User
        User savedUser = userRepository.save(userBuilder.build());
        return userMapper.toResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Cập nhật thông tin chung
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());

        // Cập nhật thông tin riêng
        if (user.getRole() == Role.ROLE_STUDENT) {
            if (request.getStudentCode() != null && !request.getStudentCode().isBlank()) {
                if (!request.getStudentCode().equals(user.getStudentCode())
                        && userRepository.existsByStudentCode(request.getStudentCode())) {
                    throw new BusinessException("Mã sinh viên đã tồn tại");
                }
                user.setStudentCode(request.getStudentCode());
            }
        } else if (user.getRole() == Role.ROLE_LECTURER) {
            if (request.getLecturerCode() != null && !request.getLecturerCode().isBlank()) {
                if (!request.getLecturerCode().equals(user.getLecturerCode())
                        && userRepository.existsByLecturerCode(request.getLecturerCode())) {
                    throw new BusinessException("Mã giảng viên đã tồn tại");
                }
                user.setLecturerCode(request.getLecturerCode());
            }
            if (request.getDepartment() != null) {
                user.setDepartment(request.getDepartment());
            }
        }

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return userMapper.toResponse(user);
    }

    // --- ĐÃ BỔ SUNG HÀM NÀY ĐỂ FIX LỖI ---
    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(userMapper::toResponse);
    }
    public void resetPassword(String username){
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username",username ));
        user.setPassword(passwordEncoder.encode("123456"));
        emailService.forgetPassword(user.getEmail(),user.getUsername());
        userRepository.save(user);
    }
}