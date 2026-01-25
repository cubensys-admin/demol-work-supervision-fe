export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  username: string;
  email: string;
  role: string;
  region?: string | null;
  zone?: string | null;
}
