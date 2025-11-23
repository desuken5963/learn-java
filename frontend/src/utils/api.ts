const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface UserRegistrationRequest {
  username: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  user: UserResponse;
}

export interface ApiError {
  message?: string;
  [key: string]: string | undefined;
}

export interface PostResponse {
  id: number;
  title: string;
  content: string;
  author: UserResponse;
  createdAt: string;
  updatedAt: string;
}

// JWTトークンを取得するヘルパー関数
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// 認証が必要なAPIリクエスト用の共通fetch関数
async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}

export async function registerUser(data: UserRegistrationRequest): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.message || Object.values(errorData).join(', ') || '登録に失敗しました');
  }

  return response.json();
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.message || Object.values(errorData).join(', ') || 'ログインに失敗しました');
  }

  return response.json();
}

// 認証が必要なAPI: 現在のユーザー情報を取得
export async function getCurrentUser(): Promise<{ username: string; message: string }> {
  const response = await authenticatedFetch(`${API_BASE_URL}/users/me`);
  
  if (!response.ok) {
    if (response.status === 401) {
      // 認証エラーの場合、トークンを削除
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      throw new Error('認証が必要です。再度ログインしてください。');
    }
    const errorData: ApiError = await response.json();
    throw new Error(errorData.message || 'ユーザー情報の取得に失敗しました');
  }
  
  return response.json();
}

// 認証が必要なAPI: 全投稿一覧を取得
export async function getAllPosts(): Promise<PostResponse[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/posts`);
  
  if (!response.ok) {
    if (response.status === 401) {
      // 認証エラーの場合、トークンを削除
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      throw new Error('認証が必要です。再度ログインしてください。');
    }
    const errorData: ApiError = await response.json();
    throw new Error(errorData.message || '投稿の取得に失敗しました');
  }
  
  return response.json();
}

// 認証が必要なAPI: 投稿詳細を取得
export async function getPostById(id: number): Promise<PostResponse> {
  const response = await authenticatedFetch(`${API_BASE_URL}/posts/${id}`);
  
  if (!response.ok) {
    if (response.status === 401) {
      // 認証エラーの場合、トークンを削除
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      throw new Error('認証が必要です。再度ログインしてください。');
    }
    if (response.status === 404) {
      throw new Error('投稿が見つかりません');
    }
    const errorData: ApiError = await response.json();
    throw new Error(errorData.message || '投稿の取得に失敗しました');
  }
  
  return response.json();
}

