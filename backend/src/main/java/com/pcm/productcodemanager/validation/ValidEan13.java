package com.pcm.productcodemanager.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = Ean13Validator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidEan13 {

    String message() default "Barcode must be a valid 13-digit EAN-13 code with correct checksum";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

