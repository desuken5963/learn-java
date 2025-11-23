'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerUser, UserRegistrationRequest } from '@/utils/api'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<UserRegistrationRequest>({
    username: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

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
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const response = await registerUser(formData)
      setSuccessMessage(`登録が完了しました！ユーザー名: ${response.username}`)
      
      // 3秒後にホームページにリダイレクト
      setTimeout(() => {
        router.push('/')
      }, 3000)
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
        setErrors({ general: '登録に失敗しました' })
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
        <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>ユーザー登録</h1>
        
        {successMessage && (
          <div style={{
            padding: '1rem',
            background: '#d4edda',
            color: '#155724',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #c3e6cb'
          }}>
            {successMessage}
          </div>
        )}

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
            <label htmlFor="username" style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              ユーザー名
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={50}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.username ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
            {errors.username && (
              <p style={{ color: '#dc3545', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                {errors.username}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              maxLength={100}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.email ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
            {errors.email && (
              <p style={{ color: '#dc3545', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                {errors.email}
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
              minLength={8}
              maxLength={100}
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
            <p style={{ color: '#666', marginTop: '0.25rem', fontSize: '0.875rem' }}>
              8文字以上100文字以下で入力してください
            </p>
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
            {isSubmitting ? '登録中...' : '登録'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <Link href="/" style={{ color: '#007bff', textDecoration: 'none' }}>
            ホームに戻る
          </Link>
        </div>
      </div>
    </main>
  )
}

