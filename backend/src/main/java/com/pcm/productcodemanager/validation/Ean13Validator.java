package com.pcm.productcodemanager.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class Ean13Validator implements ConstraintValidator<ValidEan13, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return true;
        }
        return isValidEan13(value);
    }

    public static boolean isValidEan13(String value) {
        if (value == null || value.length() != 13 || !value.matches("^[0-9]{13}$")) {
            return false;
        }

        int oddSum = 0;
        int evenSum = 0;

        for (int i = 0; i < 12; i++) {
            int digit = Character.digit(value.charAt(i), 10);
            if (i % 2 == 0) {
                oddSum += digit; // 1st, 3rd, 5th, 7th, 9th, 11th digit (0-indexed even)
            } else {
                evenSum += digit; // 2nd, 4th, 6th, 8th, 10th, 12th digit (0-indexed odd)
            }
        }

        int total = oddSum + (evenSum * 3);
        int remainder = total % 10;
        int checkDigit = (10 - remainder) % 10;

        int actualCheckDigit = Character.digit(value.charAt(12), 10);
        return checkDigit == actualCheckDigit;
    }
}

