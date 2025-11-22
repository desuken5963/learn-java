import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bulletin Board',
  description: '掲示板アプリケーション',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}


