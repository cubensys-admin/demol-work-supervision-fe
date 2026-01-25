'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { login } from '@/features/auth/login/api/login';
import type { LoginRequest } from '@/features/auth/login/model/types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

const INITIAL_FORM: LoginRequest = {
  username: '',
  password: '',
};

export function LoginForm() {
  const [form, setForm] = useState<LoginRequest>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await login(form);
      router.replace('/');
    } catch (error) {
      console.error(error);
      toast.error('아이디 또는 비밀번호를 확인해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-[420px] flex-col gap-6 rounded-3xl border border-border-neutral bg-white p-8 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]"
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-heading">로그인</h1>
        <p className="text-secondary">
          해체공사 감리 시스템 계정으로 로그인하여 서비스를 이용하세요.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex flex-col gap-2 text-sm font-medium text-heading">
          아이디
          <Input
            name="username"
            placeholder="아이디를 입력해 주세요"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-heading">
          비밀번호
          <Input
            name="password"
            type="password"
            placeholder="비밀번호를 입력해 주세요"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </label>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '로그인 중...' : '로그인'}
      </Button>
    </form>
  );
}
