package com.pcm.productcodemanager.security;

import com.pcm.productcodemanager.entity.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private final String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long expirationMs = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(tokenProvider, "jwtSecret", secret);
        ReflectionTestUtils.setField(tokenProvider, "jwtExpirationMs", expirationMs);
        tokenProvider.init();
    }

    @Test
    @DisplayName("Should generate valid JWT token for UserPrincipal")
    void testGenerateAndValidateToken() {
        UUID userId = UUID.randomUUID();
        UserPrincipal userPrincipal = UserPrincipal.builder()
                .id(userId)
                .username("admin")
                .fullName("System Admin")
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .active(true)
                .build();

        String token = tokenProvider.generateTokenFromUserPrincipal(userPrincipal);
        assertNotNull(token);
        assertTrue(token.split("\\.").length == 3);

        boolean isValid = tokenProvider.validateToken(token);
        assertTrue(isValid);

        UUID extractedUserId = tokenProvider.getUserIdFromToken(token);
        assertEquals(userId, extractedUserId);

        String extractedUsername = tokenProvider.getUsernameFromToken(token);
        assertEquals("admin", extractedUsername);
    }

    @Test
    @DisplayName("Should reject malformed or fake JWT tokens")
    void testRejectInvalidToken() {
        assertFalse(tokenProvider.validateToken("invalid.jwt.token"));
        assertFalse(tokenProvider.validateToken(""));
        assertFalse(tokenProvider.validateToken(null));
    }
}

