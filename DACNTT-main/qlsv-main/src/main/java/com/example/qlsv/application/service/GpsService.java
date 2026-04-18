package com.example.qlsv.application.service;

/**
 * Service xử lý các nghiệp vụ liên quan đến tọa độ và khoảng cách GPS.
 */
public interface GpsService {
    /**
     * Tính khoảng cách giữa hai điểm tọa độ (mét).
     */
    double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2);

    /**
     * Kiểm tra khoảng cách và ném ngoại lệ nếu vượt quá giới hạn cấu hình.
     */
    void checkDistanceOrThrow(Double studentLat, Double studentLon, Double teacherLat, Double teacherLon);
}
