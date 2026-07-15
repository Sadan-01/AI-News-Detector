export interface User {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenData {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Prediction {
  id: number;
  user_id: number;
  news_text: string;
  prediction: string;
  confidence: number;
  created_at: string;
}

export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}
