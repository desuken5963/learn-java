'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getPostById, deletePost, PostResponse, getCommentsByPostId, CommentResponse } from '@/utils/api'

interface User {
  id: number
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  const [post, setPost] = useState<PostResponse | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [comments, setComments] = useState<CommentResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // 投稿を取得
        const postData = await getPostById(Number(postId))
        setPost(postData)

        // コメント一覧を取得
        const commentsData = await getCommentsByPostId(Number(postId))
        setComments(commentsData)

        // 現在のユーザー情報を取得（所有者チェック用）
        try {
          const userStr = localStorage.getItem('user')
          if (userStr) {
            const userData = JSON.parse(userStr)
            setCurrentUser(userData)
          }
        } catch (e) {
          // ユーザー情報の取得に失敗しても投稿は表示
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('投稿の取得に失敗しました')
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (postId) {
      fetchPost()
    }
  }, [postId, router])

  const handleDelete = async () => {
    if (!confirm('本当にこの投稿を削除しますか？')) {
      return
    }

    try {
      await deletePost(Number(postId))
      // 削除成功後、ホームページにリダイレクト
      router.push('/')
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message)
      } else {
        alert('削除に失敗しました')
      }
    }
  }

  const isOwner = currentUser && post && currentUser.id === post.author.id

  if (isLoading) {
    return (
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <p>読み込み中...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          padding: '1rem',
          background: '#f8d7da',
          color: '#721c24',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <p>{error}</p>
        </div>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          ホームに戻る
        </button>
      </main>
    )
  }

  if (!post) {
    return (
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <p>投稿が見つかりません</p>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            marginTop: '1rem'
          }}
        >
          ホームに戻る
        </button>
      </main>
    )
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '0.5rem 1rem',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            marginBottom: '1rem'
          }}
        >
          ← 戻る
        </button>
      </div>

      <article style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          marginTop: 0,
          marginBottom: '1rem',
          fontSize: '2rem',
          color: '#333'
        }}>
          {post.title}
        </h1>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #eee',
          fontSize: '0.875rem',
          color: '#666'
        }}>
          <div>
            <span style={{ marginRight: '1rem' }}>
              投稿者: <strong>{post.author.username}</strong>
            </span>
            <span>
              投稿日時: {new Date(post.createdAt).toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        <div style={{
          lineHeight: '1.8',
          color: '#333',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {post.content}
        </div>

        {isOwner && (
          <div style={{
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid #eee',
            display: 'flex',
            gap: '1rem'
          }}>
            <button
              onClick={() => router.push(`/posts/${post.id}/edit`)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              編集
            </button>
            <button
              onClick={handleDelete}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              削除
            </button>
          </div>
        )}
      </article>

      {/* コメントセクション */}
      <section style={{
        marginTop: '2rem',
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          marginTop: 0,
          marginBottom: '1.5rem',
          fontSize: '1.5rem',
          color: '#333',
          borderBottom: '2px solid #007bff',
          paddingBottom: '0.5rem'
        }}>
          コメント ({comments.length})
        </h2>

        {comments.length === 0 ? (
          <p style={{
            color: '#666',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '2rem 0'
          }}>
            まだコメントがありません
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  padding: '1.5rem',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <strong style={{ color: '#333', fontSize: '0.95rem' }}>
                        {comment.author.username}
                      </strong>
                      <span style={{
                        color: '#666',
                        fontSize: '0.875rem'
                      }}>
                        {new Date(comment.createdAt).toLocaleString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div style={{
                      color: '#333',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {comment.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

