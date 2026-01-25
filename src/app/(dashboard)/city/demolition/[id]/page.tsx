'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getCityDemolitionRequestById } from '@/entities/demolition/api';
import type { DemolitionRequestDetail } from '@/entities/demolition/model/types';
import { DemolitionRequestDetail as DetailView } from '@/features/demolition/detail/ui/DemolitionRequestDetail';
import { useAuthStore } from '@/shared/model/authStore';

export const dynamic = 'force-dynamic';

export default function CityDemolitionDetailPage() {
  const { id: rawId } = useParams();
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const hydrate = useAuthStore((state) => state.hydrate);
  const id = Number(rawId);
  const [request, setRequest] = useState<DemolitionRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    hydrate();
    setIsHydrated(true);
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated) return;

    if (role && role !== 'CITY_HALL') {
      router.replace('/');
      return;
    }

    if (!id || Number.isNaN(id)) {
      router.replace('/city/demolition/status');
      return;
    }

    const loadRequest = async () => {
      setIsLoading(true);
      try {
        const data = await getCityDemolitionRequestById(id);
        setRequest(data);
      } catch (error) {
        console.error(error);
        toast.error('해체감리 요청 정보를 찾을 수 없습니다.');
        router.replace('/city/demolition/status');
      } finally {
        setIsLoading(false);
      }
    };

    if (role === 'CITY_HALL') {
      void loadRequest();
    }
  }, [id, role, router, isHydrated]);

  if (!isHydrated || !role) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <span className="text-secondary">로딩 중...</span>
      </div>
    );
  }

  if (role !== 'CITY_HALL') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <span className="text-secondary">접근 권한이 없습니다.</span>
      </div>
    );
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
