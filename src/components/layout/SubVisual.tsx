'use client';

import { usePathname } from 'next/navigation';

const getSubVisualImage = (pathname: string): string => {
  // 1. 소개
  if (pathname.startsWith('/about')) {
    return 'https://imgdocu.sira.or.kr/seouldml_temp/final/subvisual_01.jpg';
  }

  // 2. 업무알림
  if (pathname.startsWith('/work-notifications')) {
    return 'https://imgdocu.sira.or.kr/seouldml_temp/final/subvisual_02.jpg';
  }

  // 3. 등재 신청/조회
  if (
    pathname.startsWith('/recruitments-manage') ||
    pathname.startsWith('/recruitments') ||
    pathname.startsWith('/applicants-manage') ||
    pathname.startsWith('/applicants-apply') ||
    pathname.startsWith('/applicant-info-change') ||
    pathname.startsWith('/applications')
  ) {
    return 'https://imgdocu.sira.or.kr/seouldml_temp/final/subvisual_03.jpg';
  }

  // 4. 해체공사감리 관리
  if (
    pathname.startsWith('/architect/demolition') ||
    pathname.startsWith('/city/demolition') ||
    pathname.startsWith('/district/demolition') ||
    pathname.startsWith('/inspector/demolition') ||
    pathname.startsWith('/demolition')
  ) {
    return 'https://imgdocu.sira.or.kr/seouldml_temp/final/subvisual_04.jpg';
  }

  // 5. 유용한 정보
  if (
    pathname.startsWith('/notices-manage') ||
    pathname.startsWith('/notices') ||
    pathname.startsWith('/resources-manage') ||
    pathname.startsWith('/archives')
  ) {
    return 'https://imgdocu.sira.or.kr/seouldml_temp/final/subvisual_05.jpg';
  }

  // 6. 서비스 관리
  if (
    pathname.startsWith('/board-management') ||
    pathname.startsWith('/popup-management') ||
    pathname.startsWith('/fee-management') ||
    pathname.startsWith('/message-management')
  ) {
    return 'https://imgdocu.sira.or.kr/seouldml_temp/final/subvisual_06.jpg';
  }

  // 7. 마이페이지
  if (
    pathname.startsWith('/my-info') ||
    pathname.startsWith('/other-info-change') ||
    pathname.startsWith('/settlement')
  ) {
    return 'https://imgdocu.sira.or.kr/seouldml_temp/final/subvisual_07.jpg';
  }

  // 기본 이미지 (dashboard 등)
  return 'https://imgdocu.sira.or.kr/seouldml_temp/final/subvisual_01.jpg';
};

export function SubVisual() {
  const pathname = usePathname();
  const backgroundImage = getSubVisualImage(pathname);

  return (
    <div
      className="relative flex h-[220px] w-full items-center justify-center overflow-hidden rounded-none"
      style={{
        backgroundImage: `url("${backgroundImage}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      role="img"
      aria-label="해체공사감리 서비스 소개"
    >
      <p
        className="px-4 text-center text-white"
        style={{
          fontSize: '30px',
          fontWeight: 600,
          lineHeight: 'normal',
          letterSpacing: '-0.75px',
        }}
      >
        더 안전하고 투명한 서울을 위한 해체공사감리업무 관리시스템
      </p>
    </div>
  );
}
