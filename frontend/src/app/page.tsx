'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<string>('チェック中...')

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

    checkHealth()
  }, [])

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>掲示板アプリケーション</h1>
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>システムステータス</h2>
        <p>バックエンド: {healthStatus}</p>
      </div>
    </main>
  )
}


