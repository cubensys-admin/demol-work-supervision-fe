'use client';

import { ArchitectDemolitionRecommendationList } from '@/features/demolition/recommendation/ui/ArchitectDemolitionRecommendationList';
import { useAuthStore } from '@/shared/model/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

/**
 * Architect Society Demolition Supervisor Assigned Page
 * Shows only SUPERVISOR_ASSIGNED status
 * Only accessible by ARCHITECT_SOCIETY role
 */
export default function ArchitectDemolitionRecommendationPage() {
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

  return <ArchitectDemolitionRecommendationList />;
}
