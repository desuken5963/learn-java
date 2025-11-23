package com.bulletinboard.filter;

import com.bulletinboard.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        
        // Authorizationヘッダーがない、またはBearerで始まらない場合はスキップ
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // "Bearer "を除去してトークンを取得
            final String jwt = authHeader.substring(7);
            
            // トークンを検証
            if (jwtService.validateToken(jwt)) {
                // トークンからユーザー名を取得
                String username = jwtService.getUsernameFromToken(jwt);
                
                // 認証情報を作成
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        new ArrayList<>()
                    );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // SecurityContextに認証情報を設定
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            // トークンの検証に失敗した場合は、認証情報を設定せずに続行
            // これにより、認証が必要なエンドポイントでは401エラーが返される
        }

        filterChain.doFilter(request, response);
    }
}

