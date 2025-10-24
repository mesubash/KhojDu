package com.khojdu.backend.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class EmailUtil {

    @Value("${email.base-url}")
    private String baseUrl;

    public String buildVerificationLink(String token) {
        return baseUrl + "/verify-email?token=" + token;
    }

    public String buildPasswordResetLink(String token) {
        return baseUrl + "/reset-password?token=" + token;
    }

    public String buildPropertyLink(String propertyId) {
        return baseUrl + "/properties/" + propertyId;
    }

    public String replaceTemplateVariables(String template, Map<String, String> variables) {
        String result = template;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            result = result.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return result;
    }

    public boolean isValidEmailTemplate(String template) {
        return template != null &&
                template.contains("{{") &&
                template.contains("}}");
    }
}

