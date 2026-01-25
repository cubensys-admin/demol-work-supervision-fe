'use client';

import Link from 'next/link';

import { SiteHeader } from '@/widgets/site-header/SiteHeader';
import { SiteFooter } from '@/widgets/site-footer/SiteFooter';
import { Button } from '@/shared/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-page">
      <SiteHeader />

      <div className="pt-[120px]">
        <div
          className="relative h-[220px] w-full overflow-hidden rounded-none"
          style={{
            backgroundImage: 'url("/assets/landing/image%201.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          role="img"
          aria-label="페이지를 찾을 수 없습니다"
        />

        <div className="mx-auto flex max-w-[960px] flex-col items-center px-6 py-16 text-center">
          <h1 className="text-3xl font-bold text-heading md:text-4xl">페이지를 찾을 수 없습니다.</h1>
          <p className="mt-4 text-base text-secondary md:text-lg">
            요청하신 페이지가 삭제되었거나 주소가 변경되었을 수 있습니다. 홈으로 돌아가 필요한 정보를 찾아보세요.
          </p>
          <Link href="/" className="mt-8 inline-flex">
            <Button type="button">홈으로 이동</Button>
          </Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

