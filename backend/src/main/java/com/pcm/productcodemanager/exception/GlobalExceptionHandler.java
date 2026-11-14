package com.pcm.productcodemanager.exception;

import com.pcm.productcodemanager.common.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Object>> handleAppException(AppException ex) {
        log.warn("Business application exception: [{}] {}", ex.getErrorCode().getCode(), ex.getMessage());
        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .message(ex.getMessage())
                .data(ex.getErrorCode().getCode())
                .build();
        return new ResponseEntity<>(response, ex.getErrorCode().getHttpStatus());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<List<ErrorDetail>>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<ErrorDetail> errors = new ArrayList<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.add(ErrorDetail.builder()
                    .field(error.getField())
                    .rejectedValue(error.getRejectedValue())
                    .message(error.getDefaultMessage())
                    .build());
        }

        log.warn("Validation failed: {} field errors", errors.size());
        ApiResponse<List<ErrorDetail>> response = ApiResponse.<List<ErrorDetail>>builder()
                .success(false)
                .message("Validation failed for input arguments")
                .data(errors)
                .build();
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<List<ErrorDetail>>> handleConstraintViolation(ConstraintViolationException ex) {
        List<ErrorDetail> errors = new ArrayList<>();
        ex.getConstraintViolations().forEach(violation -> errors.add(ErrorDetail.builder()
                .field(violation.getPropertyPath().toString())
                .rejectedValue(violation.getInvalidValue())
                .message(violation.getMessage())
                .build()));

        ApiResponse<List<ErrorDetail>> response = ApiResponse.<List<ErrorDetail>>builder()
                .success(false)
                .message("Constraint violation occurred")
                .data(errors)
                .build();
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.error("Database integrity constraint violation: ", ex);
        String message = "Database integrity violation. Please ensure related records exist and unique constraints are respected.";
        if (ex.getMessage() != null && ex.getMessage().contains("fk_scan_histories_product")) {
            message = "Product cannot be physically deleted because it has associated scan history. Please archive it instead.";
        }
        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .message(message)
                .data("DATA_INTEGRITY_VIOLATION")
                .build();
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentials(BadCredentialsException ex) {
        log.warn("Authentication failure: {}", ex.getMessage());
        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .message("Invalid username or password")
                .data(ErrorCode.UNAUTHORIZED.getCode())
                .build();
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .message("You do not have permission to perform this action")
                .data(ErrorCode.FORBIDDEN.getCode())
                .build();
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(Exception ex) {
        log.error("Unhandled server exception: ", ex);
        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .message("An unexpected error occurred on the server")
                .data(ErrorCode.INTERNAL_SERVER_ERROR.getCode())
                .build();
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

