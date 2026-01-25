'use client';

import { DistrictDemolitionRequestList } from '@/features/demolition/status/ui/DistrictDemolitionRequestList';
import { useAuthStore } from '@/shared/model/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * District Office Demolition Status Page
 * Only accessible by DISTRICT_OFFICE role
 */
export default function DistrictDemolitionStatusPage() {
  const role = useAuthStore((state) => state.role);
  const router = useRouter();

  useEffect(() => {
    if (role && role !== 'DISTRICT_OFFICE') {
      router.push('/');
    }
  }, [role, router]);

  if (role !== 'DISTRICT_OFFICE') {
    return null;
  }

  return <DistrictDemolitionRequestList />;
}
