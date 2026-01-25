import type { Metadata } from "next";
import localFont from 'next/font/local';

import "./globals.css";
import { AppToaster } from "@/shared/ui/AppToaster";

const pretendard = localFont({
  src: [
    { path: '../../public/fonts/pretendard/Pretendard-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/pretendard/Pretendard-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/pretendard/Pretendard-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/pretendard/Pretendard-Bold.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  preload: true,
  variable: '--font-pretendard',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Helvetica', 'Arial', 'sans-serif'],
});

export const metadata: Metadata = {
  title: "건축물 해체 공사 감리 시스템",
  description: "서울특별시 건축물 해체공사감리자 주요 서비스 안내",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${pretendard.className} ${pretendard.variable} antialiased`}>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
