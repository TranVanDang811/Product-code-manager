package com.pcm.productcodemanager.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = ProductCodeValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidProductCode {

    String message() default "Product code must be exactly 6 digits (leading zeros allowed)";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

