package com.khojdu.backend.service;

public interface EmailService {
    void sendVerificationEmail(String email, String fullName, String verificationToken);
    void sendPasswordResetEmail(String email, String fullName, String resetToken);
    void sendReactivationEmail(String email, String fullName, String reactivationToken);
    void sendWelcomeEmail(String email, String fullName);
    void sendPropertyApprovedEmail(String email, String fullName, String propertyTitle);
    void sendInquiryNotificationEmail(String email, String fullName, String propertyTitle, String inquiryMessage);
}
