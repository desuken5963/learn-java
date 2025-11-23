package com.bulletinboard.controller;

import com.bulletinboard.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        String username = SecurityUtil.getCurrentUsername();
        
        if (username == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "認証されていません");
            return ResponseEntity.status(401).body(new HashMap<>(error));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("username", username);
        response.put("message", "認証成功");
        
        return ResponseEntity.ok(response);
    }
}

