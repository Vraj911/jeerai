package com.jeerai.backend.config;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.web.filter.OncePerRequestFilter;
public class PrivateNetworkAccessFilter extends OncePerRequestFilter {
    private static final String REQUEST_PRIVATE_NETWORK_HEADER = "Access-Control-Request-Private-Network";
    private static final String ALLOW_PRIVATE_NETWORK_HEADER = "Access-Control-Allow-Private-Network";
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        if ("true".equalsIgnoreCase(request.getHeader(REQUEST_PRIVATE_NETWORK_HEADER))) {
            response.setHeader(ALLOW_PRIVATE_NETWORK_HEADER, "true");
        }
        filterChain.doFilter(request, response);
    }
}
