package com.pcm.productcodemanager.validation;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProductCodeValidatorTest {

    @ParameterizedTest
    @ValueSource(strings = {
            "001234", // Leading zeros
            "000000", // All zeros
            "999999", // All nines
            "123456", // Regular sequence
            "050505"  // Alternating with zero
    })
    @DisplayName("Should accept valid 6-digit product codes including leading zeros")
    void testValidProductCode(String code) {
        assertTrue(ProductCodeValidator.isValidProductCode(code), "Expected code to be valid: " + code);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "12345",   // 5 digits (too short)
            "1234567", // 7 digits (too long)
            "00123a",  // contains alphabet
            "abcdef",  // all alphabets
            "001 34",  // contains whitespace
            "",        // empty
            " "        // space
    })
    @DisplayName("Should reject invalid product codes")
    void testInvalidProductCode(String code) {
        assertFalse(ProductCodeValidator.isValidProductCode(code), "Expected code to be invalid: " + code);
    }

    @Test
    @DisplayName("Should reject null product code")
    void testNullProductCode() {
        assertFalse(ProductCodeValidator.isValidProductCode(null));
    }
}

