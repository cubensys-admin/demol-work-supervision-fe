'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getInspectorDemolitionRequestById } from '@/entities/demolition/api';
import type { DemolitionRequestDetail } from '@/entities/demolition/model/types';
import { DemolitionRequestDetail as DetailView } from '@/features/demolition/detail/ui/DemolitionRequestDetail';
import { useAuthStore } from '@/shared/model/authStore';

export default function InspectorDemolitionDetailPage() {
  const { id: rawId } = useParams();
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const id = Number(rawId);
  const [request, setRequest] = useState<DemolitionRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (role && role !== 'INSPECTOR') {
      router.replace('/');
      return;
    }

    if (!id || Number.isNaN(id)) {
      router.replace('/demolition/inspector-work');
      return;
    }

    const loadRequest = async () => {
      setIsLoading(true);
      try {
        const data = await getInspectorDemolitionRequestById(id);
        setRequest(data);
      } catch (error) {
        console.error(error);
        toast.error('감리자 배정 정보를 찾을 수 없습니다.');
        router.replace('/demolition/inspector-work');
      } finally {
        setIsLoading(false);
      }
    };

    if (role === 'INSPECTOR') {
      void loadRequest();
    }
  }, [id, role, router]);

  if (role && role !== 'INSPECTOR') {
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
