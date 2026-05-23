package com.smartadv.backend.controller;

import com.smartadv.backend.common.security.UserContext;
import com.smartadv.backend.domain.SessionToken;
import com.smartadv.backend.domain.User;
import com.smartadv.backend.repository.SessionTokenRepository;
import com.smartadv.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final SessionTokenRepository sessionTokenRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public record GoogleLoginRequest(String credential) {}

    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
        String idToken = request.credential();
        if (idToken == null || idToken.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing google credential token."));
        }

        String googleUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = restTemplate.getForObject(googleUrl, Map.class);
            if (payload == null || payload.containsKey("error_description")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid Google Token."));
            }

            String googleSub = (String) payload.get("sub");
            String email = (String) payload.get("email");
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            if (googleSub == null || email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Incomplete Google Token payload."));
            }

            User user = userRepository.findByGoogleSub(googleSub)
                    .orElseGet(() -> userRepository.save(User.builder()
                            .googleSub(googleSub)
                            .email(email)
                            .name(name)
                            .picture(picture)
                            .build()));

            user.updateProfile(name, picture);
            userRepository.save(user);

            // Generate session token valid for 7 days
            String token = UUID.randomUUID().toString();
            SessionToken sessionToken = SessionToken.builder()
                    .token(token)
                    .user(user)
                    .expiresAt(LocalDateTime.now().plusDays(7))
                    .build();
            sessionTokenRepository.save(sessionToken);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "name", user.getName(),
                    "picture", user.getPicture() != null ? user.getPicture() : ""
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Google Token verification failed: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        User user = UserContext.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in."));
        }
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "picture", user.getPicture() != null ? user.getPicture() : ""
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            sessionTokenRepository.deleteById(token);
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully."));
    }
}
