package com.example.qlsv.infrastructure.service; // Hoặc package hiện tại của bạn

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendAttendanceWarning(String toEmail, String studentName, String courseCode, String time) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("CẢNH BÁO VẮNG MẶT: " + courseCode);
            message.setText("Xin chào " + studentName + ",\n\n" +
                    "Bạn vừa bị ghi nhận VẮNG MẶT trong lớp học phần " + courseCode + " vào lúc " + time + ".\n" +
                    "Nếu có sai sót, vui lòng liên hệ giảng viên ngay lập tức.\n\n" +
                    "Trân trọng,\nPhòng Đào Tạo");
            mailSender.send(message);
            log.info("Sent attendance warning email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage());
        }
    }
    public void forgetPassword(String toEmail, String username) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Quên mật khẩu: " + username);
            message.setText("Xin chào " + username + ",\n\n" +
                    "Bạn vừa gửi yêu cầu reset khi quên mật khẩu,mật khẩu mới của bạn sẽ là 123456\n \n" +
                    "Trân trọng!!");
            mailSender.send(message);
            log.info("Sent attendance warning email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage());
        }
    }

    // [FIX 5] Thêm tham số double absentPercent
    public void sendBanWarning(String toEmail, String studentName, String courseCode, double absentPercent) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("CẢNH BÁO CẤM THI: " + courseCode);
            message.setText("Xin chào " + studentName + ",\n\n" +
                    "Cảnh báo: Bạn đã vắng mặt " + absentPercent + "% số buổi học của môn " + courseCode + ".\n" +
                    "Theo quy chế, bạn có nguy cơ bị CẤM THI nếu tỷ lệ này vượt quá 30%.\n" +
                    "Vui lòng đi học đầy đủ các buổi còn lại.\n\n" +
                    "Trân trọng,\nPhòng Đào Tạo");
            mailSender.send(message);
            log.info("Sent ban warning email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send ban email: {}", e.getMessage());
        }
    }
}