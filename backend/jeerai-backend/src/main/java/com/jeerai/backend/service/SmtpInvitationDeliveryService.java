package com.jeerai.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.jeerai.backend.model.Invitation;
import com.jeerai.backend.model.Workspace;

@Service
@ConditionalOnProperty(prefix = "app.mail", name = "enabled", havingValue = "true")
public class SmtpInvitationDeliveryService implements InvitationDeliveryService {

    private static final Logger log = LoggerFactory.getLogger(SmtpInvitationDeliveryService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String smtpPassword;

    public SmtpInvitationDeliveryService(
            JavaMailSender mailSender,
            @Value("${app.mail.from}") String fromAddress,
            @Value("${spring.mail.password:}") String smtpPassword) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.smtpPassword = smtpPassword;
    }

    @Override
    public void sendWorkspaceInvitation(Invitation invitation, Workspace workspace, String inviteLink) {
        if (isPlaceholderPassword(smtpPassword)) {
            log.warn(
                    "SMTP is enabled but MAIL_PASSWORD is not set (or is a placeholder). Skipping email delivery. workspaceId={}, email={}",
                    workspace.getId(),
                    invitation.getEmail());
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(invitation.getEmail());
        message.setSubject("You're invited to join " + workspace.getName() + " on Jeerai");
        message.setText(buildBody(invitation, workspace, inviteLink));

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            throw new EmailDeliveryException(
                    "Failed to send workspace invitation email. Check SMTP configuration (MAIL_HOST/MAIL_PORT/MAIL_USERNAME/MAIL_PASSWORD).",
                    ex);
        }
    }

    private boolean isPlaceholderPassword(String password) {
        if (password == null) {
            return true;
        }
        String trimmed = password.trim();
        if (trimmed.isEmpty()) {
            return true;
        }
        return "MOCK_APP_PASSWORD".equalsIgnoreCase(trimmed)
                || "CHANGE_ME".equalsIgnoreCase(trimmed)
                || trimmed.toLowerCase().contains("mock")
                || trimmed.toLowerCase().contains("placeholder");
    }

    private String buildBody(Invitation invitation, Workspace workspace, String inviteLink) {
        return """
                You have been invited to join the workspace "%s" on Jeerai.

                Role: %s
                Invitation link: %s

                This invitation expires on: %s
                """.formatted(
                workspace.getName(),
                invitation.getRole(),
                inviteLink,
                invitation.getExpiresAt());
    }
}
