package com.example.qlsv.application.impl;

import com.example.qlsv.application.service.GpsService;
import com.example.qlsv.domain.exception.GpsException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GpsServiceImpl implements GpsService {

    @Value("${app.max-allowed-distance:50}")
    private double maxDistance;

    private static final double EARTH_RADIUS = 6371e3; // Bán kính trái đất tính bằng mét

    @Override
    public double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return Double.MAX_VALUE;
        }

        double phi1 = Math.toRadians(lat1);
        double phi2 = Math.toRadians(lat2);
        double deltaPhi = Math.toRadians(lat2 - lat1);
        double deltaLambda = Math.toRadians(lon2 - lon1);

        // Công thức Haversine
        double a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                   Math.cos(phi1) * Math.cos(phi2) *
                   Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }

    @Override
    public void checkDistanceOrThrow(Double studentLat, Double studentLon, Double teacherLat, Double teacherLon) {
        // Kiểm tra tính hợp lệ của tọa độ sinh viên
        if (studentLat == null || studentLon == null) {
            throw new GpsException("Không thể xác định vị trí của bạn. Vui lòng bật định vị GPS trên trình duyệt.");
        }

        // Nếu phiên điểm danh của giáo viên không có tọa độ (ví dụ dữ liệu cũ), bỏ qua kiểm tra này
        if (teacherLat == null || teacherLon == null) {
            return;
        }

        double distance = calculateDistance(studentLat, studentLon, teacherLat, teacherLon);
        
        if (distance > maxDistance) {
            throw new GpsException(String.format("Bạn đang ở quá xa phòng học (%.1f mét). Giới hạn cho phép: %.1f mét.", distance, maxDistance));
        }
    }
}
