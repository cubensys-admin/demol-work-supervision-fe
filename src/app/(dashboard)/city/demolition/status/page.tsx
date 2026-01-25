'use client';

import { CityDemolitionRequestList } from '@/features/demolition/status/ui/CityDemolitionRequestList';
import { useAuthStore } from '@/shared/model/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * City Hall Demolition Status Page
 * Only accessible by CITY_HALL role
 */
export default function CityDemolitionStatusPage() {
  const role = useAuthStore((state) => state.role);
  const router = useRouter();

  useEffect(() => {
    if (role && role !== 'CITY_HALL') {
      router.push('/');
    }
  }, [role, router]);

  if (role !== 'CITY_HALL') {
    return null;
  }

  return <CityDemolitionRequestList />;
}
