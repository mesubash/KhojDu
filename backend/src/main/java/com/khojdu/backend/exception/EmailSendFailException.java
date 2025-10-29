package com.khojdu.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class EmailSendFailException extends RuntimeException {

    public EmailSendFailException(String email) {
        super(String.format("Failed to send mail to ", email));
    }

    public EmailSendFailException(String message, Throwable cause) {
        super(message, cause);
    }
}