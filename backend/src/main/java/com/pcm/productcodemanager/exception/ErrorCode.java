package com.pcm.productcodemanager.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    INTERNAL_SERVER_ERROR("ERR_500", "Internal server error occurred", HttpStatus.INTERNAL_SERVER_ERROR),
    RESOURCE_NOT_FOUND("ERR_404", "Resource not found", HttpStatus.NOT_FOUND),
    DUPLICATE_RESOURCE("ERR_409", "Resource already exists", HttpStatus.CONFLICT),
    BAD_REQUEST("ERR_400", "Invalid request parameters", HttpStatus.BAD_REQUEST),
    VALIDATION_FAILED("ERR_422", "Input validation failed", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("ERR_401", "Full authentication is required to access this resource", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("ERR_403", "You do not have permission to perform this action", HttpStatus.FORBIDDEN),
    INVALID_BARCODE_FORMAT("ERR_BARCODE_INVALID", "Barcode must be a 13-digit EAN-13 code with valid checksum", HttpStatus.BAD_REQUEST),
    INVALID_PRODUCT_CODE_FORMAT("ERR_PRODUCT_CODE_INVALID", "Product code must be exactly 6 digits", HttpStatus.BAD_REQUEST),
    PRODUCT_CANNOT_BE_DELETED("ERR_DELETE_RESTRICTED", "Product has associated scan history and can only be archived", HttpStatus.CONFLICT);

    private final String code;
    private final String defaultMessage;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String defaultMessage, HttpStatus httpStatus) {
        this.code = code;
        this.defaultMessage = defaultMessage;
        this.httpStatus = httpStatus;
    }
}

