package com.assetflow.nexora.security;

import com.assetflow.nexora.entity.Role;
import com.assetflow.nexora.entity.User;
import com.assetflow.nexora.repository.RoleRepository;
import com.assetflow.nexora.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository,
            RoleRepository roleRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader == null || !authorizationHeader.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(BEARER_PREFIX.length());
        try {
            if (jwtService.isValid(token) && SecurityContextHolder.getContext().getAuthentication() == null) {
                String email = jwtService.extractEmail(token);
                userRepository.findByEmail(email)
                        .filter(user -> "Active".equals(user.status))
                        .ifPresent(this::setAuthentication);
            }
        } catch (RuntimeException ignored) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private void setAuthentication(User user) {
        Role role = roleRepository.findById(user.roleId).orElse(null);
        String roleName = role == null ? "Employee" : role.name;
        String authority = "ROLE_" + roleName.toUpperCase().replace(" ", "_");

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                user.email,
                null,
                List.of(new SimpleGrantedAuthority(authority)));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
