'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  getDistrictDemolitionRequests,
  getCityDemolitionRequests,
  getArchitectDemolitionRequests,
  assignSupervisor,
} from '@/entities/demolition/api';
import type {
  DemolitionRequestStatus,
  DemolitionRequestSummary,
  DemolitionRequestType,
} from '@/entities/demolition/model/types';
import { getDemolitionStatusLabel, getDemolitionStatusBadge, getDemolitionTypeLabel } from '@/entities/demolition/model/status';
import { formatDate } from '@/shared/lib/date';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { useAuthStore } from '@/shared/model/authStore';

const ZONE_OPTIONS = ['ALL', '서북권', '동북권', '동남권', '서남권'] as const;
const FILTER_FIELD_CLASS = 'flex flex-col gap-1 text-xs font-medium text-heading w-full max-w-[160px]';

type AppliedFilters = {
  status?: DemolitionRequestStatus;
  requestType?: DemolitionRequestType;
  region?: string;
  zone?: string;
  periodNumber?: number;
  ownerName?: string;
  supervisorName?: string;
  supervisorLicense?: string;
};

export function DemolitionRequestList() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const [requests, setRequests] = useState<DemolitionRequestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'ALL' | DemolitionRequestStatus>('ALL');
  const [requestTypeFilter, setRequestTypeFilter] = useState<'ALL' | DemolitionRequestType>('ALL');
  const [regionFilter, setRegionFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState<(typeof ZONE_OPTIONS)[number]>('ALL');
  const [periodNumberFilter, setPeriodNumberFilter] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});
  const showManagementColumn = role === 'DISTRICT_OFFICE';

  const requestTypeOptions = useMemo(
    () => [
      { value: 'ALL', label: '전체 유형' },
      ...(['RECOMMENDATION', 'PRIORITY_DESIGNATION'] as DemolitionRequestType[]).map((type) => ({
        value: type,
        label: getDemolitionTypeLabel(type),
      })),
    ],
    [],
  );

  const statusOptions = useMemo(
    () => [
      { value: 'ALL', label: '전체 상태' },
      ...(
        [
          'INITIAL_REQUEST',
          'INITIAL_REJECTED',
          'RE_REQUEST',
          'VERIFICATION_REQUESTED',
          'VERIFICATION_COMPLETED',
          'VERIFICATION_REJECTED',
          'RECOMMENDATION_COMPLETED',
          'SUPERVISOR_ASSIGNED',
          'SUPERVISOR_COMPLETED',
          'CANCELLED',
        ] as DemolitionRequestStatus[]
      ).map((status) => ({
        value: status,
        label: getDemolitionStatusLabel(status),
      })),
    ],
    [],
  );

  const loadRequests = useCallback(async () => {
    if (!role) {
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (role === 'CITY_HALL') {
        response = await getCityDemolitionRequests({
          page: currentPage,
          status: appliedFilters.status,
          requestType: appliedFilters.requestType,
          region: appliedFilters.region,
          ownerName: appliedFilters.ownerName,
          supervisorName: appliedFilters.supervisorName,
          supervisorLicense: appliedFilters.supervisorLicense,
        });
      } else if (role === 'ARCHITECT_SOCIETY') {
        response = await getArchitectDemolitionRequests({
          page: currentPage,
          status: appliedFilters.status,
          requestType: appliedFilters.requestType,
          region: appliedFilters.region,
        });
      } else {
        response = await getDistrictDemolitionRequests({
          page: currentPage,
          status: appliedFilters.status,
          requestType: appliedFilters.requestType,
          region: appliedFilters.region,
          zone: appliedFilters.zone,
          periodNumber: appliedFilters.periodNumber,
        });
      }
      setRequests(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error(error);
      toast.error('요청 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters, currentPage, role]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    setStatusFilter('ALL');
    setRequestTypeFilter('ALL');
    setRegionFilter('');
    setZoneFilter('ALL');
    setPeriodNumberFilter('');
    setAppliedFilters({});
    setCurrentPage(0);
  }, [role]);

  const applyFilters = () => {
    const normalizedRegion = regionFilter.trim();
    const normalizedPeriod = periodNumberFilter.trim();
    const parsedPeriod = normalizedPeriod !== '' ? Number(normalizedPeriod) : undefined;

    setAppliedFilters({
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      requestType: requestTypeFilter === 'ALL' ? undefined : requestTypeFilter,
      region: normalizedRegion || undefined,
      zone: zoneFilter === 'ALL' ? undefined : zoneFilter,
      periodNumber:
        parsedPeriod !== undefined && Number.isFinite(parsedPeriod)
          ? Math.trunc(parsedPeriod)
          : undefined,
    });
    setCurrentPage(0);
  };

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyFilters();
  };

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setRequestTypeFilter('ALL');
    setRegionFilter('');
    setZoneFilter('ALL');
    setPeriodNumberFilter('');
    setAppliedFilters({});
    setCurrentPage(0);
  };

  const handleAssignSupervisor = async (id: number) => {
    if (!window.confirm('감리자를 최종 지정하시겠습니까?')) return;

    try {
      await assignSupervisor(id);
      toast.success('감리자가 지정되었습니다.');
      loadRequests();
    } catch (error) {
      console.error(error);
      toast.error('감리자 지정에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-[20px] border border-border-neutral bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-heading">해체감리 요청 현황</h1>
            <p className="text-sm text-secondary">
              등록된 해체감리 요청을 한눈에 확인하고 관리할 수 있습니다.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-secondary">
              <span>총 {totalElements.toLocaleString()}건</span>
              <span>
                페이지 {totalPages === 0 ? 0 : currentPage + 1} / {totalPages}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={loadRequests}
            >
              새로고침
            </Button>
            {role === 'DISTRICT_OFFICE' && (
              <Button
                type="button"
                onClick={() => router.push('/demolition/request')}
              >
                새 요청 등록
              </Button>
            )}
          </div>
        </div>

        <form onSubmit={handleFilterSubmit} className="mt-6 flex flex-wrap items-end gap-3">
          <label className={FILTER_FIELD_CLASS}>
            요청 유형
            <Select
              value={requestTypeFilter}
              onChange={(event) =>
                setRequestTypeFilter(event.target.value as 'ALL' | DemolitionRequestType)
              }
            >
              {requestTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
          <label className={FILTER_FIELD_CLASS}>
            상태
            <Select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as 'ALL' | DemolitionRequestStatus)
              }
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>
          <label className={FILTER_FIELD_CLASS}>
            지역
            <Input
              className="h-9 rounded-md border border-border-neutral bg-white px-3 text-sm text-heading focus:outline-none"
              placeholder="예: 강남구"
              value={regionFilter}
              onChange={(event) => setRegionFilter(event.target.value)}
            />
          </label>
          <label className={FILTER_FIELD_CLASS}>
            권역
            <Select
              value={zoneFilter}
              onChange={(event) => setZoneFilter(event.target.value as (typeof ZONE_OPTIONS)[number])}
            >
              {ZONE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === 'ALL' ? '전체 권역' : option}
                </option>
              ))}
            </Select>
          </label>
          <label className={FILTER_FIELD_CLASS}>
            기수
            <Input
              className="h-9 rounded-md border border-border-neutral bg-white px-3 text-sm text-heading focus:outline-none"
              type="number"
              min={0}
              step={1}
              placeholder="예: 1"
              value={periodNumberFilter}
              onChange={(event) => setPeriodNumberFilter(event.target.value)}
            />
          </label>
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={handleResetFilters}>
              초기화
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              검색
            </Button>
          </div>
        </form>

        <div className="mt-6 overflow-x-auto">
          <div className="w-full overflow-hidden rounded-[16px] border border-border-neutral bg-white">
            <table className="min-w-full border-collapse text-sm">
              <caption className="sr-only">해체감리 요청 목록</caption>
              <thead className="bg-[#EDF6FF] text-left text-[13px] font-semibold text-secondary">
                <tr>
                  <th className="px-4 py-3">No.</th>
                  <th className="px-4 py-3" style={{ minWidth: '65px' }}>기수</th>
                  <th className="px-4 py-3">요청번호</th>
                  <th className="px-4 py-3 text-center" style={{ minWidth: '130px' }}>요청일</th>
                  <th className="px-4 py-3">요청 타입</th>
                  <th className="px-4 py-3" style={{ minWidth: '90px' }}>구청</th>
                  <th className="px-4 py-3" style={{ minWidth: '80px' }}>지역</th>
                  <th className="px-4 py-3" style={{ minWidth: '80px' }}>권역</th>
                  <th className="px-4 py-3 text-center" style={{ minWidth: '130px' }}>상태</th>
                  <th className="px-4 py-3 text-center">검증 요청</th>
                  <th className="px-4 py-3 text-center">검증 완료</th>
                  <th className="px-4 py-3">감리자</th>
                  {showManagementColumn && <th className="px-4 py-3">관리</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-neutral/70">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={showManagementColumn ? 13 : 12}
                      className="px-4 py-12 text-center text-secondary"
                    >
                      로딩 중...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={showManagementColumn ? 13 : 12}
                      className="px-4 py-12 text-center text-secondary"
                    >
                      등록된 요청이 없습니다.
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => {
                    return (
                      <tr
                        key={request.id}
                        className="cursor-pointer transition-colors hover:bg-gray-50"
                        onClick={() => router.push(`/demolition/${request.id}`)}
                      >
                        <td className="px-4 py-3 text-heading">{request.id}</td>
                        <td className="px-4 py-3 text-secondary">
                          {request.periodNumber != null ? `${request.periodNumber}기` : '-'}
                        </td>
                        <td className="px-4 py-3 text-primary underline-offset-2 hover:underline">
                          {request.requestNumber}
                        </td>
                        <td className="px-4 py-3 text-center text-secondary">{formatDate(request.requestDate)}</td>
                        <td className="px-4 py-3 text-secondary">{getDemolitionTypeLabel(request.requestType)}</td>
                        <td className="px-4 py-3 text-secondary">{request.districtOffice}</td>
                        <td className="px-4 py-3 text-secondary">{request.region || '-'}</td>
                        <td className="px-4 py-3 text-secondary">{request.zone || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={getDemolitionStatusBadge(request.status)}
                            style={{ display: 'inline-block', width: '88px', textAlign: 'center', padding: '8px 12px', borderRadius: '4px' }}
                          >
                            {getDemolitionStatusLabel(request.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-secondary">
                          {request.verificationRequestedAt ? formatDate(request.verificationRequestedAt) : '-'}
                        </td>
                        <td className="px-4 py-3 text-center text-secondary">
                          {request.verificationCompletedAt ? formatDate(request.verificationCompletedAt) : '-'}
                        </td>
                        <td className="px-4 py-3 text-secondary">{request.supervisorName || '-'}</td>
                        {showManagementColumn && (
                          <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                            <div className="flex flex-wrap gap-2">
                              {request.status === 'RECOMMENDATION_COMPLETED' && (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => void handleAssignSupervisor(request.id)}
                                >
                                  감리자 지정
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-1">
            <button type="button" disabled={currentPage === 0} onClick={() => setCurrentPage(0)} className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
            </button>
            <button type="button" disabled={currentPage === 0} onClick={() => setCurrentPage((prev) => prev - 1)} className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i).filter((pageNum) => { if (totalPages <= 10) return true; let start: number; let end: number; if (currentPage < 5) { start = 0; end = 9; } else if (currentPage > totalPages - 6) { start = totalPages - 10; end = totalPages - 1; } else { start = currentPage - 4; end = currentPage + 5; } return pageNum >= start && pageNum <= end; }).map((pageNum) => (
              <button key={pageNum} type="button" onClick={() => setCurrentPage(pageNum)} className={`flex h-8 w-8 items-center justify-center rounded border text-sm font-medium ${pageNum === currentPage ? 'border-[#0D77DE] bg-[#0D77DE] text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
                {pageNum + 1}
              </button>
            ))}
            <button type="button" disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage((prev) => prev + 1)} className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
            <button type="button" disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(totalPages - 1)} className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
