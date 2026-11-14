package com.pcm.productcodemanager.validation;

import com.pcm.productcodemanager.common.AppConstants;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ProductCodeValidator implements ConstraintValidator<ValidProductCode, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return isValidProductCode(value);
    }

    public static boolean isValidProductCode(String value) {
        if (value == null) {
            return false;
        }
        return value.matches(AppConstants.PRODUCT_CODE_REGEX);
    }
}

