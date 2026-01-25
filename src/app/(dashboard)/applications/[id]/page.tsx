'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getApplicantById } from '@/entities/applicant/api';
import type { ApplicantDetail } from '@/entities/applicant/model/types';
import { ApplicationDetail } from '@/features/applicant/detail/ui/ApplicationDetail';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [application, setApplication] = useState<ApplicantDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadApplication() {
      try {
        const data = await getApplicantById(id);
        setApplication(data);
      } catch (error) {
        console.error(error);
        toast.error('지원 정보를 찾을 수 없습니다.');
        router.push('/applicants-apply/status');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadApplication();
    }
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-secondary">로딩 중...</div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-secondary">지원 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return <ApplicationDetail application={application} />;
}
