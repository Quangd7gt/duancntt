-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3307
-- Thời gian đã tạo: Th3 11, 2026 lúc 07:21 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `student_attendance_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `attendance_records`
--

CREATE TABLE `attendance_records` (
  `id` bigint(20) NOT NULL,
  `check_in_time` datetime(6) DEFAULT NULL,
  `status` enum('PRESENT','ABSENT','LATE','EXCUSED') DEFAULT NULL,
  `session_id` bigint(20) DEFAULT NULL,
  `student_user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `attendance_sessions`
--

CREATE TABLE `attendance_sessions` (
  `id` bigint(20) NOT NULL,
  `qr_code_data` varchar(255) DEFAULT NULL,
  `start_time` datetime(6) DEFAULT NULL,
  `status` enum('OPEN','CLOSED') DEFAULT NULL,
  `course_id` bigint(20) DEFAULT NULL,
  `lecturer_user_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `courses`
--

CREATE TABLE `courses` (
  `id` bigint(20) NOT NULL,
  `course_code` varchar(255) NOT NULL,
  `day_of_week` enum('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') DEFAULT NULL,
  `end_time` time(6) DEFAULT NULL,
  `start_time` time(6) DEFAULT NULL,
  `semester_id` bigint(20) DEFAULT NULL,
  `subject_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `course_lecturers`
--

CREATE TABLE `course_lecturers` (
  `course_id` bigint(20) NOT NULL,
  `lecturer_user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `course_registrations`
--

CREATE TABLE `course_registrations` (
  `course_id` bigint(20) NOT NULL,
  `student_user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `leave_requests`
--

CREATE TABLE `leave_requests` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `request_date` date NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT NULL,
  `type` enum('ABSENCE','LATE') DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `course_id` bigint(20) NOT NULL,
  `student_user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `semesters`
--

CREATE TABLE `semesters` (
  `id` bigint(20) NOT NULL,
  `end_date` date NOT NULL,
  `name` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `year` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `subjects`
--

CREATE TABLE `subjects` (
  `id` bigint(20) NOT NULL,
  `credits` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `subject_code` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `department` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `enabled` bit(1) NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `lecturer_code` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ROLE_STUDENT','ROLE_LECTURER','ROLE_ADMIN','ROLE_SECRETARY') DEFAULT NULL,
  `student_code` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `department`, `email`, `enabled`, `first_name`, `last_name`, `lecturer_code`, `password`, `role`, `student_code`, `username`) VALUES
(1, NULL, 'admin@test.com', b'1', 'Super', 'Admin', NULL, '$2a$10$XjBm79vX4OmfduSUwT7JQuO.NEuDxammdlSuPAwmtzRfF2vKcf/Fu', 'ROLE_ADMIN', NULL, 'admin'),
(2, 'CNTT', 'hung@test.com', b'1', 'Hung', 'Tran', 'GV001', '$2a$10$8Ejvi48MNnkKAJXRM9TQNetINzpWxjNyZAaBg8fjb0BMw/EMCQJM6', 'ROLE_LECTURER', NULL, 'gv.hung'),
(3, NULL, 'nam@test.com', b'1', 'Nam', 'Nguyen', NULL, '$2a$10$yUg9o7WIwzjg/ZhC5not5OwOs1j4O2mbQVE/Ou5p0k6PPHCm06PBi', 'ROLE_STUDENT', 'SV001', 'sv.nam'),
(4, NULL, 'mainhuyen02904@gmail.com', b'1', 'Business', 'Yến', NULL, '$2a$10$CvpDzwrA0okwu0.yLSSuHe.iDupdBJAOsB73yD6E189C90fe4lA5.', 'ROLE_ADMIN', NULL, 'admin2');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_att_record_session_student` (`session_id`,`student_user_id`),
  ADD KEY `FKc23i79rpem5iuuau8qd5fo409` (`student_user_id`);

--
-- Chỉ mục cho bảng `attendance_sessions`
--
ALTER TABLE `attendance_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKp5k3w98vipd1losxua8vhv1m8` (`course_id`),
  ADD KEY `FK69ennmo2m96s8rnhu98x4k4ml` (`lecturer_user_id`);

--
-- Chỉ mục cho bảng `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_p02ts69sh53ptd62m3c67v0` (`course_code`),
  ADD KEY `idx_course_semester` (`semester_id`),
  ADD KEY `idx_course_code` (`course_code`),
  ADD KEY `FK5tckdihu5akp5nkxiacx1gfhi` (`subject_id`);

--
-- Chỉ mục cho bảng `course_lecturers`
--
ALTER TABLE `course_lecturers`
  ADD PRIMARY KEY (`course_id`,`lecturer_user_id`),
  ADD KEY `FK8uwb04m6yfflun4olos1xq3xy` (`lecturer_user_id`);

--
-- Chỉ mục cho bảng `course_registrations`
--
ALTER TABLE `course_registrations`
  ADD PRIMARY KEY (`course_id`,`student_user_id`),
  ADD KEY `FKfu18vmcb6h8nt2a8qrlbcnm5w` (`student_user_id`);

--
-- Chỉ mục cho bảng `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKncksmyd2dfo2qlmeu4oko63i6` (`course_id`),
  ADD KEY `FKq01vfef49m93k3p5mrwtijrtl` (`student_user_id`);

--
-- Chỉ mục cho bảng `semesters`
--
ALTER TABLE `semesters`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_qt734ivq9gq4yo4p1j1lhhk8l` (`subject_code`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`),
  ADD UNIQUE KEY `UK_r43af9ap4edm43mmtq01oddj6` (`username`),
  ADD UNIQUE KEY `UK_4bpk3cwiwedo1hian0q149idx` (`lecturer_code`),
  ADD UNIQUE KEY `UK_cvkic8422oiw1di0trqm9fibr` (`student_code`),
  ADD KEY `idx_user_student_code` (`student_code`),
  ADD KEY `idx_user_lecturer_code` (`lecturer_code`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `attendance_records`
--
ALTER TABLE `attendance_records`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `attendance_sessions`
--
ALTER TABLE `attendance_sessions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `courses`
--
ALTER TABLE `courses`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `semesters`
--
ALTER TABLE `semesters`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD CONSTRAINT `FKc23i79rpem5iuuau8qd5fo409` FOREIGN KEY (`student_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKfaf92mkjrosrvdqq5bev7cl1m` FOREIGN KEY (`session_id`) REFERENCES `attendance_sessions` (`id`);

--
-- Các ràng buộc cho bảng `attendance_sessions`
--
ALTER TABLE `attendance_sessions`
  ADD CONSTRAINT `FK69ennmo2m96s8rnhu98x4k4ml` FOREIGN KEY (`lecturer_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKp5k3w98vipd1losxua8vhv1m8` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);

--
-- Các ràng buộc cho bảng `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `FK5tckdihu5akp5nkxiacx1gfhi` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  ADD CONSTRAINT `FKlr7ck4w266my7691avtikan92` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`);

--
-- Các ràng buộc cho bảng `course_lecturers`
--
ALTER TABLE `course_lecturers`
  ADD CONSTRAINT `FK6w0px9r1dcry4q3biwlal2rco` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `FK8uwb04m6yfflun4olos1xq3xy` FOREIGN KEY (`lecturer_user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `course_registrations`
--
ALTER TABLE `course_registrations`
  ADD CONSTRAINT `FK2ypycu19srngwbgyvlqlacwly` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `FKfu18vmcb6h8nt2a8qrlbcnm5w` FOREIGN KEY (`student_user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD CONSTRAINT `FKncksmyd2dfo2qlmeu4oko63i6` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `FKq01vfef49m93k3p5mrwtijrtl` FOREIGN KEY (`student_user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
