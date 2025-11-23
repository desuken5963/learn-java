package com.bulletinboard.service;

import com.bulletinboard.dto.UserRegistrationRequest;
import com.bulletinboard.dto.UserResponse;
import com.bulletinboard.entity.User;
import com.bulletinboard.exception.ResourceAlreadyExistsException;
import com.bulletinboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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

