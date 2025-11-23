'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getAllPosts, PostResponse } from '@/utils/api'

interface User {
  id: number
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

export default function Home() {
  const router = useRouter()
  const [healthStatus, setHealthStatus] = useState<string>('チェック中...')
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState<PostResponse[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/health')
        const data = await response.json()
        setHealthStatus(data.message || '接続成功')
      } catch (error) {
        setHealthStatus('接続エラー: バックエンドに接続できません')
      }
    }

    // ログイン状態を確認（サーバー側で検証）
    const checkLoginStatus = async () => {
      try {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        
        if (token && userStr) {
          // サーバー側でトークンを検証
          try {
            const serverUser = await getCurrentUser()
            // サーバー側の検証が成功した場合、ローカルのユーザー情報を使用
            const userData = JSON.parse(userStr)
            setUser(userData)
          } catch (error) {
            // サーバー側の検証に失敗した場合（トークンが無効など）
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkHealth()
    checkLoginStatus()
  }, [])

  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        return
      }

      setIsLoadingPosts(true)
      try {
        const postsData = await getAllPosts()
        setPosts(postsData)
      } catch (error) {
        console.error('投稿の取得に失敗しました:', error)
        setPosts([])
      } finally {
        setIsLoadingPosts(false)
      }
    }

    fetchPosts()
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.refresh()
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>掲示板アプリケーション</h1>
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px', marginBottom: '2rem' }}>
        <h2>システムステータス</h2>
        <p>バックエンド: {healthStatus}</p>
      </div>
      
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px', marginBottom: '2rem' }}>
        <h2>ログイン状態</h2>
        {isLoading ? (
          <p>確認中...</p>
        ) : user ? (
          <div>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>ログイン中</strong>
            </p>
            <p style={{ marginBottom: '0.25rem', color: '#666' }}>
              ユーザー名: {user.username}
            </p>
            <p style={{ marginBottom: '0.5rem', color: '#666' }}>
              メールアドレス: {user.email}
            </p>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              ログアウト
            </button>
          </div>
        ) : (
          <p>ログインしていません</p>
        )}
      </div>

      {!user && (
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          flexWrap: 'wrap'
        }}>
          <a 
            href="/register" 
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '500'
            }}
          >
            ユーザー登録
          </a>
          <a 
            href="/login" 
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '500'
            }}
          >
            ログイン
          </a>
        </div>
      )}

      {user && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2>投稿一覧</h2>
            <a
              href="/posts/new"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: '500'
              }}
            >
              新規投稿
            </a>
          </div>

          {isLoadingPosts ? (
            <p>投稿を読み込み中...</p>
          ) : posts.length === 0 ? (
            <div style={{
              padding: '2rem',
              background: '#f5f5f5',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666'
            }}>
              <p>投稿がありません。最初の投稿を作成しましょう！</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {posts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    padding: '1.5rem',
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  onClick={() => router.push(`/posts/${post.id}`)}
                >
                  <h3 style={{ 
                    marginTop: 0, 
                    marginBottom: '0.5rem',
                    color: '#333'
                  }}>
                    {post.title}
                  </h3>
                  <p style={{ 
                    marginBottom: '1rem',
                    color: '#666',
                    lineHeight: '1.6',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {post.content}
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    color: '#999'
                  }}>
                    <span>投稿者: {post.author.username}</span>
                    <span>
                      {new Date(post.createdAt).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  )
}


