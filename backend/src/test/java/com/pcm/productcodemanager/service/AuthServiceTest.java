package com.pcm.productcodemanager.service;

import com.pcm.productcodemanager.dto.request.LoginRequest;
import com.pcm.productcodemanager.dto.response.LoginResponse;
import com.pcm.productcodemanager.dto.response.UserResponse;
import com.pcm.productcodemanager.exception.AppException;
import com.pcm.productcodemanager.exception.ErrorCode;
import com.pcm.productcodemanager.mapper.UserMapper;
import com.pcm.productcodemanager.security.JwtTokenProvider;
import com.pcm.productcodemanager.security.UserPrincipal;
import com.pcm.productcodemanager.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthServiceImpl authService;

    private UserPrincipal userPrincipal;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        UUID userId = UUID.randomUUID();
        userPrincipal = UserPrincipal.builder()
                .id(userId)
                .username("admin")
                .fullName("System Administrator")
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .active(true)
                .build();

        userResponse = UserResponse.builder()
                .id(userId)
                .username("admin")
                .fullName("System Administrator")
                .role("ADMIN")
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Should successfully login admin with valid credentials")
    void testLoginSuccess() {
        LoginRequest request = LoginRequest.builder()
                .username("admin")
                .password("Admin@123")
                .build();

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userPrincipal);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(tokenProvider.generateToken(authentication)).thenReturn("mocked.jwt.token");
        when(tokenProvider.getExpirationMs()).thenReturn(86400000L);
        when(userMapper.toUserResponse(userPrincipal)).thenReturn(userResponse);

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getAccessToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals("admin", response.getUser().getUsername());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("Should throw UNAUTHORIZED AppException when credentials are wrong")
    void testLoginBadCredentials() {
        LoginRequest request = LoginRequest.builder()
                .username("admin")
                .password("WrongPassword")
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        AppException exception = assertThrows(AppException.class, () -> authService.login(request));
        assertEquals(ErrorCode.UNAUTHORIZED, exception.getErrorCode());
    }

    @Test
    @DisplayName("Should throw FORBIDDEN AppException when account is disabled")
    void testLoginDisabledAccount() {
        LoginRequest request = LoginRequest.builder()
                .username("admin")
                .password("Admin@123")
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new DisabledException("User is disabled"));

        AppException exception = assertThrows(AppException.class, () -> authService.login(request));
        assertEquals(ErrorCode.FORBIDDEN, exception.getErrorCode());
    }
}

