package com.pcm.productcodemanager.exception;

public class DuplicateResourceException extends AppException {

    public DuplicateResourceException(String resourceName, String fieldName, Object fieldValue) {
        super(ErrorCode.DUPLICATE_RESOURCE, String.format("%s already exists with %s: '%s'", resourceName, fieldName, fieldValue));
    }

    public DuplicateResourceException(String message) {
        super(ErrorCode.DUPLICATE_RESOURCE, message);
    }
}

