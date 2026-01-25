'use client';

import { ArchitectDemolitionRequestList } from '@/features/demolition/status/ui/ArchitectDemolitionRequestList';
import { useAuthStore } from '@/shared/model/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Architect Society Demolition Status Page
 * Only accessible by ARCHITECT_SOCIETY role
 */
export default function ArchitectDemolitionStatusPage() {
  const role = useAuthStore((state) => state.role);
  const hydrate = useAuthStore((state) => state.hydrate);
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    hydrate();
    setIsHydrated(true);
  }, [hydrate]);

  useEffect(() => {
    if (isHydrated && role && role !== 'ARCHITECT_SOCIETY') {
      router.push('/');
    }
  }, [role, router, isHydrated]);

  if (!isHydrated || !role) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <span className="text-secondary">로딩 중...</span>
      </div>
    );
  }

  if (role !== 'ARCHITECT_SOCIETY') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <span className="text-secondary">접근 권한이 없습니다.</span>
      </div>
    );
  }

  return <ArchitectDemolitionRequestList />;
}
