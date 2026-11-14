package com.pcm.productcodemanager.validation;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class Ean13ValidatorTest {

    @ParameterizedTest
    @ValueSource(strings = {
            "4006381333931", // Stabilo Boss
            "8938505974019", // Vietnam GS1 Prefix 893
            "4902430730006", // Japan GS1 Prefix 490
            "0000000000000"  // Edge-case zeros
    })
    @DisplayName("Should validate valid EAN-13 barcodes correctly")
    void testValidEan13(String barcode) {
        assertTrue(Ean13Validator.isValidEan13(barcode), "Expected barcode to be valid: " + barcode);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "8938505974015", // Checksum mismatch (expected 9, actual 5)
            "4006381333930", // Checksum mismatch
            "12345",         // Length != 13
            "12345678901234",// Length > 13
            "400638133393A", // Alphabetic
            "             "  // Blank
    })
    @DisplayName("Should reject invalid EAN-13 barcodes")
    void testInvalidEan13(String barcode) {
        assertFalse(Ean13Validator.isValidEan13(barcode), "Expected barcode to be invalid: " + barcode);
    }

    @Test
    @DisplayName("Should reject null barcode")
    void testNullBarcode() {
        assertFalse(Ean13Validator.isValidEan13(null));
    }
}

