'use client';

import { ApplicantManagement } from '@/features/applicant/management/ui/ApplicantManagement';
import { useAuthStore } from '@/shared/model/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ApplicantsManagementPage() {
  const role = useAuthStore((state) => state.role);
  const router = useRouter();

  useEffect(() => {
    if (role && role !== 'CITY_HALL' && role !== 'ARCHITECT_SOCIETY') {
      router.push('/');
    }
  }, [role, router]);

  if (role !== 'CITY_HALL' && role !== 'ARCHITECT_SOCIETY') {
    return null;
  }

  return <ApplicantManagement />;
}
