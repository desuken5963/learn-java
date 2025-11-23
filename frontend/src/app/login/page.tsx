'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, LoginRequest } from '@/utils/api'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<LoginRequest>({
    usernameOrEmail: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      const response = await login(formData)
      
      // JWTトークンをlocalStorageに保存
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      // ホームページにリダイレクト
      router.push('/')
    } catch (error) {
      if (error instanceof Error) {
        // バリデーションエラーの場合
        try {
          const errorObj = JSON.parse(error.message)
          if (typeof errorObj === 'object') {
            setErrors(errorObj)
          } else {
            setErrors({ general: error.message })
          }
        } catch {
          setErrors({ general: error.message })
        }
      } else {
        setErrors({ general: 'ログインに失敗しました' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main style={{ 
      padding: '2rem', 
      maxWidth: '600px', 
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>ログイン</h1>

        {errors.general && (
          <div style={{
            padding: '1rem',
            background: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #f5c6cb'
          }}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="usernameOrEmail" style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              ユーザー名またはメールアドレス
            </label>
            <input
              type="text"
              id="usernameOrEmail"
              name="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.usernameOrEmail ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
            {errors.usernameOrEmail && (
              <p style={{ color: '#dc3545', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                {errors.usernameOrEmail}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              パスワード
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.password ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
            {errors.password && (
              <p style={{ color: '#dc3545', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: isSubmitting ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginBottom: '1rem'
            }}
          >
            {isSubmitting ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '0.5rem', color: '#666' }}>
            アカウントをお持ちでない方は
          </p>
          <Link href="/register" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '500' }}>
            ユーザー登録
          </Link>
          {' | '}
          <Link href="/" style={{ color: '#007bff', textDecoration: 'none' }}>
            ホームに戻る
          </Link>
        </div>
      </div>
    </main>
  )
}

