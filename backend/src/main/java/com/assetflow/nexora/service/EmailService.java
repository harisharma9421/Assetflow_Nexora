package com.assetflow.nexora.service;

import com.assetflow.nexora.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String mailFrom;
    private final String resetPasswordUrl;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from}") String mailFrom,
            @Value("${app.frontend.reset-password-url}") String resetPasswordUrl) {
        this.mailSender = mailSender;
        this.mailFrom = mailFrom;
        this.resetPasswordUrl = resetPasswordUrl;
    }

    public void sendPasswordResetEmail(String toEmail, String fullName, String resetToken) {
        String resetLink = resetPasswordUrl + "?token=" + resetToken;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(toEmail);
        message.setSubject("Reset your AssetFlow password");
        message.setText("""
                Hello %s,

                We received a request to reset your AssetFlow password.

                Reset your password using this link:
                %s

                If you did not request this, you can ignore this email.

                AssetFlow Team
                """.formatted(fullName, resetLink));

        try {
            mailSender.send(message);
        } catch (MailException exception) {
            throw new BadRequestException("Unable to send password reset email");
        }
    }
}
