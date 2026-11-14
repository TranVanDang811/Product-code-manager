package com.pcm.productcodemanager.service.impl;

import com.pcm.productcodemanager.dto.request.LoginRequest;
import com.pcm.productcodemanager.dto.response.LoginResponse;
import com.pcm.productcodemanager.dto.response.UserResponse;
import com.pcm.productcodemanager.exception.AppException;
import com.pcm.productcodemanager.exception.ErrorCode;
import com.pcm.productcodemanager.mapper.UserMapper;
import com.pcm.productcodemanager.security.JwtTokenProvider;
import com.pcm.productcodemanager.security.UserPrincipal;
import com.pcm.productcodemanager.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        log.info("Attempting authentication for user: {}", request.getUsername());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername().trim(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            String token = tokenProvider.generateToken(authentication);
            UserResponse userResponse = userMapper.toUserResponse(userPrincipal);

            log.info("User {} successfully authenticated", request.getUsername());

            return LoginResponse.builder()
                    .accessToken(token)
                    .tokenType("Bearer")
                    .expiresIn(tokenProvider.getExpirationMs())
                    .user(userResponse)
                    .build();

        } catch (BadCredentialsException ex) {
            log.warn("Authentication failed for user {}: Bad credentials", request.getUsername());
            throw new AppException(ErrorCode.UNAUTHORIZED, "Invalid username or password");
        } catch (DisabledException | LockedException ex) {
            log.warn("Authentication failed for user {}: Account is locked or disabled", request.getUsername());
            throw new AppException(ErrorCode.FORBIDDEN, "Account has been locked or deactivated");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal userPrincipal)) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "No authenticated user found in current session");
        }

        return userMapper.toUserResponse(userPrincipal);
    }
}

