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

import java.util.List;
import java.util.stream.Collectors;

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

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByPostId(Long postId) {
        // 投稿の存在確認
        postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("投稿が見つかりません"));

        // 投稿に紐づくコメントを取得（作成日時の昇順）
        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(postId);

        // レスポンスDTOに変換
        return comments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse updateComment(Long postId, Long commentId, CommentRequest request) {
        // 現在認証されているユーザー名を取得
        String username = SecurityUtil.getCurrentUsername();
        if (username == null) {
            throw new AuthenticationException("認証が必要です");
        }

        // ユーザーを取得
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthenticationException("ユーザーが見つかりません"));

        // 投稿の存在確認
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("投稿が見つかりません"));

        // コメントを取得
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("コメントが見つかりません"));

        // コメントが指定された投稿に紐づいているか確認
        if (!comment.getPost().getId().equals(post.getId())) {
            throw new ResourceNotFoundException("この投稿にコメントが見つかりません");
        }

        // コメントの所有者かどうかを確認
        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new AuthenticationException("このコメントを更新する権限がありません");
        }

        // コメントを更新
        comment.setContent(request.getContent());

        // コメントを保存
        Comment updatedComment = commentRepository.save(comment);

        // レスポンスDTOに変換
        return convertToResponse(updatedComment);
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

