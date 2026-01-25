import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/login/ui/LoginForm";
import { Container } from "@/shared/ui/container";

export const metadata: Metadata = {
  title: "로그인",
  description: "해체공사 감리 시스템 관리자/감리자 로그인",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page py-24">
      <Container className="flex justify-center">
        <LoginForm />
      </Container>
    </div>
  );
}
