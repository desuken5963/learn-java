package com.bulletinboard.service;

import com.bulletinboard.dto.LoginRequest;
import com.bulletinboard.dto.LoginResponse;
import com.bulletinboard.dto.UserRegistrationRequest;
import com.bulletinboard.dto.UserResponse;
import com.bulletinboard.entity.User;
import com.bulletinboard.exception.AuthenticationException;
import com.bulletinboard.exception.ResourceAlreadyExistsException;
import com.bulletinboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public UserResponse registerUser(UserRegistrationRequest request) {
        // ユーザー名の重複チェック
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResourceAlreadyExistsException("このユーザー名は既に使用されています");
        }

        // メールアドレスの重複チェック
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("このメールアドレスは既に使用されています");
        }

        // パスワードをハッシュ化
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // ユーザーエンティティを作成
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(hashedPassword);

        // ユーザーを保存
        User savedUser = userRepository.save(user);

        // レスポンスDTOに変換
        return convertToResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        // ユーザー名またはメールアドレスでユーザーを検索
        Optional<User> userOptional = userRepository.findByUsername(request.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()));

        if (userOptional.isEmpty()) {
            throw new AuthenticationException("ユーザー名またはパスワードが正しくありません");
        }

        User user = userOptional.get();

        // パスワードの検証
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthenticationException("ユーザー名またはパスワードが正しくありません");
        }

        // JWTトークンを生成
        String token = jwtService.generateToken(user);

        // レスポンスを作成
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUser(convertToResponse(user));

        return response;
    }

    private UserResponse convertToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}

