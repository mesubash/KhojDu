package com.khojdu.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class PhoneAlreadyExistsException extends RuntimeException {

    public PhoneAlreadyExistsException(String phone) {
        super(String.format("Phone number '%s' is already registered", phone));
    }

    public PhoneAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}
