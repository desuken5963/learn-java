'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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

    // ログイン状態を確認
    const checkLoginStatus = () => {
      try {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        
        if (token && userStr) {
          const userData = JSON.parse(userStr)
          setUser(userData)
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
    </main>
  )
}


