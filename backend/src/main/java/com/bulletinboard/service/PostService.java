package com.bulletinboard.service;

import com.bulletinboard.dto.PostRequest;
import com.bulletinboard.dto.PostResponse;
import com.bulletinboard.dto.UserResponse;
import com.bulletinboard.entity.Post;
import com.bulletinboard.entity.User;
import com.bulletinboard.exception.AuthenticationException;
import com.bulletinboard.exception.ResourceNotFoundException;
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
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional
    public PostResponse createPost(PostRequest request) {
        // 現在認証されているユーザー名を取得
        String username = SecurityUtil.getCurrentUsername();
        if (username == null) {
            throw new AuthenticationException("認証が必要です");
        }

        // ユーザーを取得
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthenticationException("ユーザーが見つかりません"));

        // 投稿エンティティを作成
        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setAuthor(author);

        // 投稿を保存
        Post savedPost = postRepository.save(post);

        // レスポンスDTOに変換
        return convertToResponse(savedPost);
    }

    @Transactional(readOnly = true)
    public PostResponse getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("投稿が見つかりません"));
        return convertToResponse(post);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts() {
        List<Post> posts = postRepository.findAll();
        return posts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private PostResponse convertToResponse(Post post) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setTitle(post.getTitle());
        response.setContent(post.getContent());
        response.setCreatedAt(post.getCreatedAt());
        response.setUpdatedAt(post.getUpdatedAt());

        // 著者情報を変換
        UserResponse authorResponse = new UserResponse();
        authorResponse.setId(post.getAuthor().getId());
        authorResponse.setUsername(post.getAuthor().getUsername());
        authorResponse.setEmail(post.getAuthor().getEmail());
        authorResponse.setCreatedAt(post.getAuthor().getCreatedAt());
        authorResponse.setUpdatedAt(post.getAuthor().getUpdatedAt());
        response.setAuthor(authorResponse);

        return response;
    }
}

