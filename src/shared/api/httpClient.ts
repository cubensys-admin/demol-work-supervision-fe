import axios, { AxiosHeaders } from "axios";
import { env } from "@/shared/config/env";
import { clearAccessToken, getAccessToken } from "@/shared/lib/authToken";
import { useAuthStore } from "@/shared/model/authStore";

const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);

  // Don't set Accept header for FormData (multipart/form-data requests)
  const isFormData = config.data instanceof FormData;
  if (!isFormData && !headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  config.headers = headers;

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAccessToken();
      const authStore = useAuthStore.getState();
      authStore.clear();
    }

    if (typeof window !== "undefined") {
      import("sonner").then(({ toast }) => {
        const status = error.response?.status;
        const data = error.response?.data;
        const fallbackMessage =
          status === 401
            ? "아이디 또는 비밀번호를 확인해 주세요."
            : "요청 처리 중 오류가 발생했습니다.";

        // fieldErrors가 있으면 첫 번째 필드 에러 메시지 표시
        let message: string;
        if (data?.fieldErrors && Array.isArray(data.fieldErrors) && data.fieldErrors.length > 0) {
          const fieldError = data.fieldErrors[0];
          message = fieldError.message ?? data.message ?? fallbackMessage;
        } else {
          message = data?.message ?? data?.error ?? fallbackMessage;
        }

        toast.error(message);
      });
    }

    return Promise.reject(error);
  },
);

export { httpClient };
