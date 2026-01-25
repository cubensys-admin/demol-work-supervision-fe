'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getRecruitments } from '@/entities/recruitment/api/getRecruitments';
import type { RecruitmentListResponse } from '@/entities/recruitment/model/types';
import { useAuthStore } from '@/shared/model/authStore';
import { Button } from '@/shared/ui/button';
import { formatDate } from '@/shared/lib/date';

import { RecruitmentCard } from './RecruitmentCard';

const PAGE_SIZE = 6;

export function RecruitmentList() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<RecruitmentListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const role = useAuthStore((state) => state.role);
  const router = useRouter();

  const fetchPage = useCallback(async (targetPage: number) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getRecruitments({ page: targetPage, size: PAGE_SIZE });
      setData(response);
      setPage(response.number ?? targetPage);
    } catch (error) {
      console.error(error);
      setErrorMessage('모집공고 정보를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(0);
  }, [fetchPage]);

  const totalPages = useMemo(() => {
    if (data?.totalPages != null) return data.totalPages;
    if (data?.totalElements != null) {
      return Math.ceil((data.totalElements || 0) / (data.size || PAGE_SIZE));
    }
    return 0;
  }, [data]);

  const hasNext = data?.hasNext ?? (totalPages > 0 && page < totalPages - 1);
  const hasPrevious = data?.hasPrevious ?? page > 0;
  const content = data?.content ?? [];
  const isInspector = role === 'INSPECTOR';
  const currentPageSize = data?.size && data.size > 0 ? data.size : content.length || PAGE_SIZE;

  return (
    <section className="flex flex-col gap-6">
      <header className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <h1 className="text-2xl font-semibold text-heading">모집공고</h1>
        <p className="mt-1 text-sm text-secondary">
          시청과 건축사회가 게시한 최신 모집공고를 확인하고 지원하세요.
        </p>
      </header>

      {isLoading && (
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <div
              key={index}
              className="h-[260px] animate-pulse rounded-[20px] border border-border-neutral bg-white/60"
            />
          ))}
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-[20px] border border-red-200 bg-red-50 px-6 py-8 text-red-600">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && content.length === 0 && (
        <div className="rounded-[20px] border border-border-neutral bg-white px-6 py-12 text-center text-secondary">
          현재 게시된 모집공고가 없습니다.
        </div>
      )}

      {!isLoading && !errorMessage && content.length > 0 && (
        isInspector ? (
          <div className="overflow-x-auto">
            <div className="min-w-full overflow-hidden rounded-[16px] border border-border-neutral bg-white md:min-w-[900px] xl:min-w-[1100px]">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">해체공사감리자 모집공고 목록</caption>
                <thead className="bg-[#EDF6FF] text-left text-[13px] font-semibold text-secondary">
                  <tr>
                    <th className="px-4 py-3">No.</th>
                    <th className="px-4 py-3">모집공고명</th>
                    <th className="px-4 py-3">모집 기간</th>
                    <th className="px-4 py-3">시행 기간</th>
                    <th className="px-4 py-3">게시일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-neutral/70">
                  {content.map((item, index) => {
                    const rowNumber = page * currentPageSize + index + 1;
                    return (
                      <tr
                        key={item.id}
                        className="cursor-pointer transition-colors hover:bg-gray-50"
                        onClick={() => router.push(`/recruitments-manage/recruitments/${item.id}`)}
                      >
                        <td className="px-4 py-3 text-heading">{rowNumber}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-primary">제 {item.periodNumber}기 모집</span>
                            <span className="text-[15px] font-semibold text-heading">{item.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-secondary">
                          {formatDate(item.startDate)} ~ {formatDate(item.endDate)}
                        </td>
                        <td className="px-4 py-3 text-secondary">
                          {item.executionStartDate && item.executionEndDate
                            ? `${formatDate(item.executionStartDate)} ~ ${formatDate(item.executionEndDate)}`
                            : item.executionStartDate
                              ? `${formatDate(item.executionStartDate)} ~ -`
                              : item.executionEndDate
                                ? `- ~ ${formatDate(item.executionEndDate)}`
                                : '-'}
                        </td>
                        <td className="px-4 py-3 text-secondary">
                          {item.createdAt ? formatDate(item.createdAt) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {content.map((item) => (
              <RecruitmentCard key={item.id} recruitment={item} />
            ))}
          </div>
        )
      )}

      <footer className="flex items-center justify-between gap-4">
        <div className="text-sm text-secondary">
          Page {page + 1}
          {totalPages ? ` / ${totalPages}` : ''}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={!hasPrevious || isLoading}
            onClick={() => fetchPage(Math.max(0, page - 1))}
          >
            이전
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!hasNext || isLoading}
            onClick={() => fetchPage(page + 1)}
          >
            다음
          </Button>
        </div>
      </footer>
    </section>
  );
}
