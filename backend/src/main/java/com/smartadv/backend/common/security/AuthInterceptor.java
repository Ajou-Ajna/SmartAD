package com.smartadv.backend.common.security;

import com.smartadv.backend.domain.SessionToken;
import com.smartadv.backend.repository.SessionTokenRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final SessionTokenRepository sessionTokenRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // OPTIONS preflight requests are allowed without authorization
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("{\"error\": \"Unauthorized: Missing session token.\"}");
            return false;
        }

        String token = authHeader.substring(7);
        SessionToken sessionToken = sessionTokenRepository.findById(token).orElse(null);

        if (sessionToken == null || sessionToken.isExpired()) {
            if (sessionToken != null) {
                sessionTokenRepository.delete(sessionToken); // Clean up expired token
            }
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("{\"error\": \"Unauthorized: Session expired or invalid.\"}");
            return false;
        }

        UserContext.setCurrentUser(sessionToken.getUser());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        UserContext.clear();
    }
}
