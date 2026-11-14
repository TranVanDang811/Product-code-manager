package com.pcm.productcodemanager.common;

public final class AppConstants {

    private AppConstants() {
        // Prevent instantiation
    }

    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final String DEFAULT_SORT_BY = "createdAt";
    public static final String DEFAULT_SORT_DIRECTION = "desc";

    public static final String PRODUCT_CODE_REGEX = "^[0-9]{6}$";
    public static final String EAN13_REGEX = "^[0-9]{13}$";

    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_AUTHORIZATION = "Authorization";
}

