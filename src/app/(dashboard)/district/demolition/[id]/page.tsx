'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getDemolitionRequestById } from '@/entities/demolition/api';
import type { DemolitionRequestDetail } from '@/entities/demolition/model/types';
import { DemolitionRequestDetail as DetailView } from '@/features/demolition/detail/ui/DemolitionRequestDetail';
import { useAuthStore } from '@/shared/model/authStore';

export default function DistrictDemolitionDetailPage() {
  const { id: rawId } = useParams();
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const id = Number(rawId);
  const [request, setRequest] = useState<DemolitionRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (role && role !== 'DISTRICT_OFFICE') {
      router.replace('/');
      return;
    }

    if (!id || Number.isNaN(id)) {
      router.replace('/district/demolition/status');
      return;
    }

    const loadRequest = async () => {
      setIsLoading(true);
      try {
        const data = await getDemolitionRequestById(id);
        setRequest(data);
      } catch (error) {
        console.error(error);
        toast.error('해체감리 요청 정보를 찾을 수 없습니다.');
        router.replace('/district/demolition/status');
      } finally {
        setIsLoading(false);
      }
    };

    if (role === 'DISTRICT_OFFICE') {
      void loadRequest();
    }
  }, [id, role, router]);

  if (role && role !== 'DISTRICT_OFFICE') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <span className="text-secondary">로딩 중...</span>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <span className="text-secondary">요청 정보를 찾을 수 없습니다.</span>
      </div>
    );
  }

  return <DetailView request={request} onRefresh={(updated) => setRequest(updated)} />;
}
