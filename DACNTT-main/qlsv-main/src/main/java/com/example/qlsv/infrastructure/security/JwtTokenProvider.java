package com.example.qlsv.infrastructure.security; // Sửa lại package cho khớp với cấu trúc thư mục của bạn

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${app.jwtSecret}")
    private String secretKey;

    @Value("${app.jwtExpirationInMs}")
    private long jwtExpiration;

    // --- THAY ĐỔI 1: Trả về SecretKey thay vì Key chung chung ---
    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        // HmacShaKeyFor tự động chọn thuật toán phù hợp dựa trên độ dài key
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Authentication authentication) {
        String username = authentication.getName();

        var roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", roles);

        return buildToken(claims, username, jwtExpiration);
    }

    private String buildToken(Map<String, Object> extraClaims, String subject, long expiration) {
        return Jwts.builder()
                .subject(subject)
                .claims(extraClaims) // --- THAY ĐỔI 2: Cách put claims ---
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), Jwts.SIG.HS512) // --- THAY ĐỔI 3: Dùng Jwts.SIG.HS512 ---
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // --- THAY ĐỔI 4: Cú pháp Parser mới hoàn toàn ---
    private Claims extractAllClaims(String token) {
        return Jwts.parser() // Không dùng parserBuilder() nữa
                .verifyWith(getSignInKey()) // Thay cho setSigningKey()
                .build()
                .parseSignedClaims(token) // Thay cho parseClaimsJws()
                .getPayload(); // Thay cho getBody()
    }

    public boolean isTokenValid(String token) {
        try {
            // Cú pháp validate cũng thay đổi tương ứng
            Jwts.parser()
                    .verifyWith(getSignInKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        } catch (SecurityException e) {
            // Bắt thêm lỗi SecurityException nếu chữ ký không khớp
            log.error("Invalid JWT signature: {}", e.getMessage());
        }
        return false;
    }
}