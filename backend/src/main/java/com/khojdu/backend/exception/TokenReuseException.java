package com.khojdu.backend.exception;


import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class TokenReuseException extends RuntimeException {
    public TokenReuseException(String message) {
        super(message);
    }

    public TokenReuseException(String message, Throwable cause) {
        super(message, cause);
    }
}
