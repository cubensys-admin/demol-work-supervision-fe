'use client';

import { CityDemolitionRecommendationList } from '@/features/demolition/recommendation/ui/CityDemolitionRecommendationList';
import { useAuthStore } from '@/shared/model/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * City Hall Demolition Supervisor Assigned Page
 * Shows only SUPERVISOR_ASSIGNED status
 * Only accessible by CITY_HALL role
 */
export default function CityDemolitionRecommendationPage() {
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

  return <CityDemolitionRecommendationList />;
}
