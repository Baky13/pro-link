package com.prolink.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> sensitiveBuckets = new ConcurrentHashMap<>();

    private Bucket createBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(10)
                .refillGreedy(10, Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket createSensitiveBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(3)
                .refillGreedy(3, Duration.ofMinutes(15))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private boolean isSensitive(String uri) {
        return uri.startsWith("/api/auth/forgot-password")
                || uri.startsWith("/api/auth/reset-password")
                || uri.startsWith("/api/auth/resend-verification");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();
        String ip = getClientIp(request);

        if (isSensitive(uri)) {
            String key = ip + "|" + uri;
            Bucket bucket = sensitiveBuckets.computeIfAbsent(key, k -> createSensitiveBucket());
            if (!bucket.tryConsume(1)) {
                log.warn("Sensitive rate limit exceeded for IP: {} on {}", ip, uri);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"message\":\"Слишком много попыток. Попробуйте позже.\"}");
                return;
            }
        } else if (uri.startsWith("/api/auth/login") || uri.startsWith("/api/auth/register")) {
            Bucket bucket = buckets.computeIfAbsent(ip, k -> createBucket());

            if (!bucket.tryConsume(1)) {
                log.warn("Rate limit exceeded for IP: {} on {}", ip, uri);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"message\":\"Слишком много запросов. Попробуйте через минуту.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
