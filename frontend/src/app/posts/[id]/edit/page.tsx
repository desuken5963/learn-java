'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getPostById, updatePost, PostRequest, PostResponse } from '@/utils/api'

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  const [post, setPost] = useState<PostResponse | null>(null)
  const [formData, setFormData] = useState<PostRequest>({
    title: '',
    content: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
        setFormData({
          title: postData.title,
          content: postData.content
        })
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // エラーをクリア
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})
    setIsSubmitting(true)

    try {
      const updatedPost = await updatePost(Number(postId), formData)
      // 更新成功後、投稿詳細ページにリダイレクト
      router.push(`/posts/${postId}`)
    } catch (err) {
      if (err instanceof Error) {
        // バリデーションエラーの場合
        try {
          const errorObj = JSON.parse(err.message)
          if (typeof errorObj === 'object') {
            setFormErrors(errorObj)
          } else {
            setFormErrors({ general: err.message })
          }
        } catch {
          setFormErrors({ general: err.message })
        }
      } else {
        setFormErrors({ general: '投稿の更新に失敗しました' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

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
          onClick={() => router.push(`/posts/${postId}`)}
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

      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ marginTop: 0, marginBottom: '2rem' }}>投稿を編集</h1>

        <form onSubmit={handleSubmit}>
          {formErrors.general && (
            <div style={{
              padding: '1rem',
              background: '#f8d7da',
              color: '#721c24',
              borderRadius: '4px',
              marginBottom: '1rem',
              border: '1px solid #f5c6cb'
            }}>
              {formErrors.general}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="title" style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              タイトル
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={200}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${formErrors.title ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
            {formErrors.title && (
              <p style={{ color: '#dc3545', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                {formErrors.title}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="content" style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              本文
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={10}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${formErrors.content ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
            {formErrors.content && (
              <p style={{ color: '#dc3545', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                {formErrors.content}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '0.75rem 1.5rem',
                background: isSubmitting ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? '更新中...' : '更新する'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/posts/${postId}`)}
              disabled={isSubmitting}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

