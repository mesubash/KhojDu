package com.khojdu.backend.service.impl;

import com.khojdu.backend.service.EmailService;
import com.khojdu.backend.util.EmailUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final EmailUtil emailUtil;

    @Value("${email.from}")
    private String fromEmail;

    @Override
    public void sendVerificationEmail(String email, String fullName, String verificationToken) {
        log.info("Sending verification email to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Verify Your KhojDu Account");

            Context context = new Context();
            context.setVariable("name", fullName);
            context.setVariable("verificationLink", emailUtil.buildVerificationLink(verificationToken));

            String htmlContent = templateEngine.process("email/verification", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Verification email sent successfully to: {}", email);

        } catch (MessagingException e) {
            log.error("Failed to send verification email to: {}", email, e);
            throw new RuntimeException("Failed to send verification email");
        }
    }

    @Override
    public void sendPasswordResetEmail(String email, String fullName, String resetToken) {
        log.info("Sending password reset email to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Reset Your KhojDu Password");

            Context context = new Context();
            context.setVariable("name", fullName);
            context.setVariable("resetLink", emailUtil.buildPasswordResetLink(resetToken));

            String htmlContent = templateEngine.process("email/password-reset", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", email);

        } catch (MessagingException e) {
            log.error("Failed to send password reset email to: {}", email, e);
            throw new RuntimeException("Failed to send password reset email");
        }
    }

    @Override
    public void sendWelcomeEmail(String email, String fullName) {
        log.info("Sending welcome email to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Welcome to KhojDu!");

            Context context = new Context();
            context.setVariable("name", fullName);

            String htmlContent = templateEngine.process("email/welcome", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Welcome email sent successfully to: {}", email);

        } catch (MessagingException e) {
            log.error("Failed to send welcome email to: {}", email, e);
            // Don't throw exception for welcome emails
        }
    }

    @Override
    public void sendPropertyApprovedEmail(String email, String fullName, String propertyTitle) {
        log.info("Sending property approved email to: {}", email);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Your Property Has Been Approved!");
            message.setText(String.format(
                    "Dear %s,\n\nGreat news! Your property listing '%s' has been approved and is now live on KhojDu.\n\nBest regards,\nThe KhojDu Team",
                    fullName, propertyTitle
            ));

            mailSender.send(message);
            log.info("Property approved email sent successfully to: {}", email);

        } catch (Exception e) {
            log.error("Failed to send property approved email to: {}", email, e);
        }
    }

    @Override
    public void sendInquiryNotificationEmail(String email, String fullName, String propertyTitle, String inquiryMessage) {
        log.info("Sending inquiry notification email to: {}", email);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("New Inquiry for Your Property");
            message.setText(String.format(
                    "Dear %s,\n\nYou have received a new inquiry for your property '%s':\n\n%s\n\nLog in to KhojDu to respond.\n\nBest regards,\nThe KhojDu Team",
                    fullName, propertyTitle, inquiryMessage
            ));

            mailSender.send(message);
            log.info("Inquiry notification email sent successfully to: {}", email);

        } catch (Exception e) {
            log.error("Failed to send inquiry notification email to: {}", email, e);
        }
    }
}
