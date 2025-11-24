package com.bulletinboard.service;

import com.bulletinboard.dto.CommentRequest;
import com.bulletinboard.dto.CommentResponse;
import com.bulletinboard.dto.UserResponse;
import com.bulletinboard.entity.Comment;
import com.bulletinboard.entity.Post;
import com.bulletinboard.entity.User;
import com.bulletinboard.exception.AuthenticationException;
import com.bulletinboard.exception.ResourceNotFoundException;
import com.bulletinboard.repository.CommentRepository;
import com.bulletinboard.repository.PostRepository;
import com.bulletinboard.repository.UserRepository;
import com.bulletinboard.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional
    public CommentResponse createComment(Long postId, CommentRequest request) {
        // 現在認証されているユーザー名を取得
        String username = SecurityUtil.getCurrentUsername();
        if (username == null) {
            throw new AuthenticationException("認証が必要です");
        }

        // ユーザーを取得
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthenticationException("ユーザーが見つかりません"));

        // 投稿を取得
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("投稿が見つかりません"));

        // コメントエンティティを作成
        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setPost(post);
        comment.setAuthor(author);

        // コメントを保存
        Comment savedComment = commentRepository.save(comment);

        // レスポンスDTOに変換
        return convertToResponse(savedComment);
    }

    private CommentResponse convertToResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        response.setUpdatedAt(comment.getUpdatedAt());

        // 著者情報を変換
        UserResponse authorResponse = new UserResponse();
        authorResponse.setId(comment.getAuthor().getId());
        authorResponse.setUsername(comment.getAuthor().getUsername());
        authorResponse.setEmail(comment.getAuthor().getEmail());
        authorResponse.setCreatedAt(comment.getAuthor().getCreatedAt());
        authorResponse.setUpdatedAt(comment.getAuthor().getUpdatedAt());
        response.setAuthor(authorResponse);

        return response;
    }
}

