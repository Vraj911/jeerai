package com.jeerai.backend.security;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
@Component
public class JwtUtil {
    private final SecretKey signingKey;
    private final long expirationMs;
    public JwtUtil(
            @Value("${app.security.jwt.secret}") String secret,
            @Value("${app.security.jwt.expiration}") long expirationMs) {
        this.signingKey = buildSigningKey(secret);
        this.expirationMs = expirationMs;
    }
    public String generateToken(String userId, String email) {
        Date issuedAt = new Date();
        Date expiration = new Date(issuedAt.getTime() + expirationMs);
        return Jwts.builder()
                .subject(userId)
                .claim("userId", userId)
                .claim("email", email)
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(signingKey)
                .compact();
    }
    public AuthenticatedUser parseToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        String userId = claims.get("userId", String.class);
        String email = claims.get("email", String.class);
        return new AuthenticatedUser(userId, email);
    }
    private SecretKey buildSigningKey(String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "Missing JWT secret. Configure 'app.security.jwt.secret' (32+ bytes recommended, Base64/Base64URL supported)."
            );
        }
        String value = secret.trim();
        byte[] keyBytes = decodeKeyMaterial(value);
        try {
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (RuntimeException ex) {
            throw new IllegalStateException(
                    "Invalid JWT secret configured in 'app.security.jwt.secret'. "
                            + "Use at least 32 bytes (256 bits) for HS256. "
                            + "Tip: generate 32 random bytes and Base64-encode them.",
                    ex
            );
        }
    }
    private byte[] decodeKeyMaterial(String value) {
        byte[] rawBytes = value.getBytes(StandardCharsets.UTF_8);
        // Only accept decoded Base64 variants when they produce a strong enough key.
        byte[] base64Bytes = tryDecode(Decoders.BASE64, value);
        if (base64Bytes != null && base64Bytes.length >= 32) {
            return base64Bytes;
        }
        byte[] base64UrlBytes = tryDecode(Decoders.BASE64URL, value);
        if (base64UrlBytes != null && base64UrlBytes.length >= 32) {
            return base64UrlBytes;
        }
        return rawBytes;
    }
    private byte[] tryDecode(io.jsonwebtoken.io.Decoder<CharSequence, byte[]> decoder, String value) {
        try {
            return decoder.decode(value);
        } catch (RuntimeException ex) {
            return null;
        }
    }
}
