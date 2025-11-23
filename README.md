# 掲示板アプリケーション

Java Spring BootとNext.jsを使用した掲示板アプリケーションの開発環境です。このリポジトリは、Java開発の学習を目的として構築されています。

## 📋 プロジェクト概要

このプロジェクトは、フルスタックなWebアプリケーション開発の学習を目的として作成されました。Docker Composeを使用して、バックエンド、フロントエンド、データベースを統合的に管理できる開発環境を提供します。

## 🛠️ 技術スタック

### バックエンド
- **言語**: Java 17
- **フレームワーク**: Spring Boot 3.2.0
- **ビルドツール**: Maven 3.9
- **データベース**: PostgreSQL 15
- **ORM**: Spring Data JPA
- **その他**: Lombok, Spring Boot DevTools

### フロントエンド
- **フレームワーク**: Next.js 14
- **言語**: TypeScript 5.3
- **UIライブラリ**: React 18.2
- **ビルドツール**: npm

### インフラストラクチャ
- **コンテナ**: Docker, Docker Compose
- **データベース**: PostgreSQL 15 (Alpine)

## 📁 プロジェクト構成

```
learn-java/
├── backend/              # Spring Boot アプリケーション
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/bulletinboard/
│   │       │       ├── BulletinBoardApplication.java
│   │       │       ├── config/          # 設定クラス
│   │       │       └── controller/      # REST API コントローラー
│   │       └── resources/
│   │           └── application.yml      # アプリケーション設定
│   ├── Dockerfile
│   └── pom.xml                          # Maven依存関係
├── frontend/            # Next.js アプリケーション
│   ├── src/
│   │   └── app/          # Next.js App Router
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       └── globals.css
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml    # 全サービスのオーケストレーション
└── README.md
```

## 🚀 セットアップ手順

### 前提条件

以下のソフトウェアがインストールされている必要があります：

- Docker Desktop (または Docker Engine + Docker Compose)
- Git

### 起動方法

1. **リポジトリをクローン（またはこのディレクトリに移動）**

```bash
cd /path/to/learn-java
```

2. **Docker Composeで全サービスを起動**

```bash
docker compose up -d
```

初回起動時は、イメージのビルドと依存関係のダウンロードに時間がかかります。

3. **サービスが起動したことを確認**

```bash
docker compose ps
```

すべてのサービスが`Up`状態であることを確認してください。

### アクセス

起動が完了すると、以下のURLでアクセスできます：

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8080/api
- **データベース**: localhost:5432

### 動作確認

ブラウザで http://localhost:3000 にアクセスし、「バックエンド: Bulletin Board API is running」と表示されれば、正常に動作しています。

## 📝 開発

### ホットリロード

Docker Composeの設定により、コードの変更は自動的に反映されます（ホットリロード対応）。

- **バックエンド**: Spring Boot DevToolsにより、Javaファイルの変更が自動反映されます
- **フロントエンド**: Next.jsの開発モードにより、TypeScript/Reactファイルの変更が自動反映されます

### バックエンド開発

バックエンドのコードは `backend/src/main/java/com/bulletinboard/` に配置します。

#### ディレクトリ構造
- `controller/` - REST APIエンドポイント
- `service/` - ビジネスロジック
- `repository/` - データアクセス層
- `entity/` - データベースエンティティ
- `dto/` - データ転送オブジェクト
- `config/` - 設定クラス

#### 開発コマンド

```bash
# バックエンドコンテナに入る
docker compose exec backend bash

# Mavenコマンドを実行
docker compose exec backend mvn clean install
```

### フロントエンド開発

フロントエンドのコードは `frontend/src/` に配置します。

#### ディレクトリ構造
- `app/` - Next.js App Router（ページとレイアウト）
- `components/` - Reactコンポーネント
- `utils/` - ユーティリティ関数
- `types/` - TypeScript型定義

#### 開発コマンド

```bash
# フロントエンドコンテナに入る
docker compose exec frontend sh

# npmコマンドを実行
docker compose exec frontend npm install <package-name>
```

## 🔧 設定

### 環境変数

環境変数は `docker-compose.yml` で設定されています。必要に応じて変更してください。

#### バックエンド
- `SPRING_DATASOURCE_URL`: データベース接続URL
- `SPRING_DATASOURCE_USERNAME`: データベースユーザー名
- `SPRING_DATASOURCE_PASSWORD`: データベースパスワード
- `SPRING_JPA_HIBERNATE_DDL_AUTO`: データベーススキーマ自動更新設定

#### フロントエンド
- `NEXT_PUBLIC_API_URL`: バックエンドAPIのURL

### データベース接続情報

- **ホスト**: `db` (Docker内) / `localhost` (ローカル接続時)
- **ポート**: 5432
- **データベース名**: `bulletin_board`
- **ユーザー名**: `postgres`
- **パスワード**: `postgres`

## 📡 API エンドポイント

### ヘルスチェック

```
GET /api/health
```

レスポンス例:
```json
{
  "status": "ok",
  "message": "Bulletin Board API is running"
}
```

## 🛠️ 便利なコマンド

### ログの確認

```bash
# 全サービスのログ
docker compose logs -f

# 特定のサービスのログ
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### サービスの停止

```bash
# サービスを停止（コンテナは残る）
docker compose stop

# サービスを停止してコンテナを削除
docker compose down

# データベースのデータも削除する場合
docker compose down -v
```

### 再ビルド

```bash
# キャッシュを使わずに再ビルド
docker compose build --no-cache

# 再ビルドして起動
docker compose up -d --build
```

### データベース操作

```bash
# PostgreSQLに接続
docker compose exec db psql -U postgres -d bulletin_board

# データベースのバックアップ
docker compose exec db pg_dump -U postgres bulletin_board > backup.sql

# データベースのリストア
docker compose exec -T db psql -U postgres bulletin_board < backup.sql
```

## 🐛 トラブルシューティング

### ポートが既に使用されている場合

`docker-compose.yml` のポート番号を変更してください。

### データベース接続エラー

データベースが完全に起動するまで少し時間がかかることがあります。以下のコマンドでログを確認してください：

```bash
docker compose logs db
```

### ビルドエラー

キャッシュをクリアして再ビルド：

```bash
docker compose build --no-cache
docker compose up -d
```

### コンテナが起動しない

コンテナのログを確認：

```bash
docker compose logs <service-name>
```

## 📚 学習リソース

このプロジェクトで学習できる内容：

- Java Spring Bootの基本的な使い方
- RESTful APIの設計と実装
- Spring Data JPAによるデータベース操作
- Next.jsとTypeScriptを使ったフロントエンド開発
- Docker Composeを使った開発環境の構築
- フルスタックアプリケーションの開発フロー

## 🔄 次のステップ

1. ✅ **エンティティモデルの作成**（完了）
   - ✅ Post（投稿）エンティティ
   - ✅ User（ユーザー）エンティティ
   - ✅ Comment（コメント）エンティティ

2. ✅ **認証機能の実装**（完了）
   - ✅ ユーザー登録API
   - ✅ ログインAPI（JWTトークン発行）
   - ✅ パスワードハッシュ化
   - ✅ JWT認証フィルター

3. **REST API エンドポイントの実装**
   - ✅ 投稿の作成、取得、更新、削除（認証必須）
   - コメント機能（認証必須）
   - ページネーション

4. ✅ **フロントエンドUIの実装**（完了）
   - ✅ ユーザー登録・ログイン画面
   - ✅ 投稿一覧表示
   - ✅ 投稿作成フォーム
   - ✅ 投稿詳細表示（編集・削除機能含む）

## 📄 ライセンス

このプロジェクトは学習目的で作成されています。

## 🤝 コントリビューション

学習目的のプロジェクトのため、プルリクエストやイシューの報告は歓迎します。
