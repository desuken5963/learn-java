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

export interface ApiError {
  message?: string;
  [key: string]: string | undefined;
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

