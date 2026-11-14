package com.pcm.productcodemanager.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pcm.productcodemanager.common.ApiResponse;
import com.pcm.productcodemanager.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {
        log.warn("Unauthorized access attempt to [{} {}]: {}",
                request.getMethod(), request.getRequestURI(), authException.getMessage());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .success(false)
                .message("Full authentication is required to access this resource: " + authException.getMessage())
                .data(ErrorCode.UNAUTHORIZED.getCode())
                .build();

        response.getOutputStream().println(objectMapper.writeValueAsString(apiResponse));
    }
}

