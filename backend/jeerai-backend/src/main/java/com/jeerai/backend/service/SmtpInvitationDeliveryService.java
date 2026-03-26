package com.jeerai.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.jeerai.backend.model.Invitation;
import com.jeerai.backend.model.Workspace;

@Service
@ConditionalOnProperty(prefix = "app.mail", name = "enabled", havingValue = "true")
public class SmtpInvitationDeliveryService implements InvitationDeliveryService {

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public SmtpInvitationDeliveryService(
            JavaMailSender mailSender,
            @Value("${app.mail.from}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    @Override
    public void sendWorkspaceInvitation(Invitation invitation, Workspace workspace, String inviteLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(invitation.getEmail());
        message.setSubject("You're invited to join " + workspace.getName() + " on Jeerai");
        message.setText(buildBody(invitation, workspace, inviteLink));

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            throw new IllegalStateException("Failed to send workspace invitation email", ex);
        }
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
