package com.jeerai.backend.security;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import com.jeerai.backend.service.UnauthorizedException;
@Component
public class CurrentUserProvider {
    public String getCurrentUserId() {
        return getAuthenticatedUser().userId();
    }
    public String getCurrentUserEmail() {
        return getAuthenticatedUser().email();
    }
    public AuthenticatedUser getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new UnauthorizedException("Authentication is required");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof AuthenticatedUser authenticatedUser) {
            return authenticatedUser;
        }
        throw new UnauthorizedException("Authenticated user context is unavailable");
    }
}
