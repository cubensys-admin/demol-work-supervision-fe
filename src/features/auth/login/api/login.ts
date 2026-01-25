import { httpClient } from "@/shared/api/httpClient";
import { setAccessToken } from "@/shared/lib/authToken";
import { useAuthStore } from "@/shared/model/authStore";

import type { LoginRequest, LoginResponse } from "../model/types";

export async function login(payload: LoginRequest) {
  const response = await httpClient.post<LoginResponse>("/api/auth/login", payload);

  const data = response.data;
  const token = data.accessToken;

  if (!token) {
    throw new Error("로그인 응답에 토큰 정보가 없습니다.");
  }

  setAccessToken(token);
  const authStore = useAuthStore.getState();
  authStore.setCredentials({
    token,
    username: data.username,
    role: data.role,
    email: data.email ?? null,
    region: data.region ?? null,
    zone: data.zone ?? null,
  });

  return data;
}
