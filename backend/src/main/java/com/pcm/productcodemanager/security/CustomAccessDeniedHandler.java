package com.pcm.productcodemanager.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pcm.productcodemanager.common.ApiResponse;
import com.pcm.productcodemanager.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException
    ) throws IOException {
        log.warn("Access denied for [{} {}]: {}",
                request.getMethod(), request.getRequestURI(), accessDeniedException.getMessage());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        ApiResponse<String> apiResponse = ApiResponse.<String>builder()
                .success(false)
                .message("You do not have permission to access this resource")
                .data(ErrorCode.FORBIDDEN.getCode())
                .build();

        response.getOutputStream().println(objectMapper.writeValueAsString(apiResponse));
    }
}

