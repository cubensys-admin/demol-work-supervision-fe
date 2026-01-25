'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getApplicantById } from '@/entities/applicant/api';
import type { ApplicantDetail } from '@/entities/applicant/model/types';
import { InspectorApplicantDetail } from '@/features/applicant/apply/ui/InspectorApplicantDetail';
import { useAuthStore } from '@/shared/model/authStore';

export default function InspectorApplicantDetailPage() {
  const { id: rawId } = useParams();
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const hydrate = useAuthStore((state) => state.hydrate);
  const [application, setApplication] = useState<ApplicantDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const id = Number(rawId);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (role && role !== 'INSPECTOR') {
      router.replace('/');
      return;
    }

    if (!Number.isFinite(id)) {
      router.replace('/applicants-apply/status');
      return;
    }

    const load = async () => {
      setIsLoading(true);
      try {
        const detail = await getApplicantById(id);
        setApplication(detail);
      } catch (error) {
        console.error(error);
        toast.error('신청 정보를 불러오지 못했습니다.');
        router.replace('/applicants-apply/status');
      } finally {
        setIsLoading(false);
      }
    };

    if (role === 'INSPECTOR') {
      void load();
    }
  }, [id, role, router]);

  if (role && role !== 'INSPECTOR') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="rounded-[20px] bg-white px-6 py-12 text-center text-secondary shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        불러오는 중...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="rounded-[20px] bg-white px-6 py-12 text-center text-secondary shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        신청 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return <InspectorApplicantDetail application={application} />;
}
