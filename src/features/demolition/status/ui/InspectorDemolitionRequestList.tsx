'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { getInspectorDemolitionRequests } from '@/entities/demolition/api';
import type {
  DemolitionRequestStatus,
  DemolitionRequestSummary,
} from '@/entities/demolition/model/types';
import { getInspectorDemolitionStatusLabel, getDemolitionStatusBadge } from '@/entities/demolition/model/status';
import { formatDate } from '@/shared/lib/date';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { Select } from '@/shared/ui/select';
import { Pagination } from '@/shared/ui/pagination';

type AppliedFilters = {
  status?: DemolitionRequestStatus;
  fromDate?: string;
  toDate?: string;
  periodNumber?: string;
  ownerName?: string;
  region?: string;
};

type SearchFieldType = 'periodNumber' | 'ownerName' | 'region';

/**
 * Inspector Demolition Request List
 * Shows demolition requests assigned to the inspector
 */
export function InspectorDemolitionRequestList() {
  const router = useRouter();
  const [requests, setRequests] = useState<DemolitionRequestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<'ALL' | DemolitionRequestStatus>('ALL');
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [toDateFilter, setToDateFilter] = useState('');
  const [searchFieldType, setSearchFieldType] = useState<SearchFieldType>('periodNumber');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  const statusOptions = useMemo(
    () => [
      { value: 'ALL', label: '전체 상태' },
      ...(
        [
          'SUPERVISOR_ASSIGNED',
          'SUPERVISOR_COMPLETED',
        ] as DemolitionRequestStatus[]
      ).map((status) => ({
        value: status,
        label: getInspectorDemolitionStatusLabel(status),
      })),
    ],
    [],
  );

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getInspectorDemolitionRequests({
        page: currentPage,
        size: pageSize,
        status: appliedFilters.status,
        fromDate: appliedFilters.fromDate,
        toDate: appliedFilters.toDate,
        periodNumber: appliedFilters.periodNumber ? Number(appliedFilters.periodNumber) : undefined,
        ownerName: appliedFilters.ownerName,
        region: appliedFilters.region,
      });
      setRequests(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error(error);
      toast.error('요청 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters, currentPage, pageSize]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApplyFilters = (event: FormEvent) => {
    event.preventDefault();
    const filters: AppliedFilters = {
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      fromDate: fromDateFilter || undefined,
      toDate: toDateFilter || undefined,
    };

    // Apply search keyword to the selected field type
    if (searchKeyword) {
      filters[searchFieldType] = searchKeyword;
    }

    setAppliedFilters(filters);
    setCurrentPage(0);
  };

  const handleReset = () => {
    setStatusFilter('ALL');
    setFromDateFilter('');
    setToDateFilter('');
    setSearchFieldType('periodNumber');
    setSearchKeyword('');
    setAppliedFilters({});
    setCurrentPage(0);
  };

  const handleRowClick = (id: number) => {
    router.push(`/inspector/demolition/${id}`);
  };

  return (
    <div className="rounded-[20px] bg-white p-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[18px] font-bold">감리수행 정보</h1>
        <button
          type="button"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
          aria-label={isFilterExpanded ? '필터 접기' : '필터 펼치기'}
        >
          <svg
            className={`transform transition-transform duration-300 ${isFilterExpanded ? 'rotate-180' : ''}`}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Filters */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isFilterExpanded ? 'max-h-[500px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'
        }`}
      >
        <form onSubmit={handleApplyFilters} className="bg-white">
        <div className="flex flex-col">
          {/* First Row: 기간 | 상태 */}
          <div className="flex items-center" style={{ borderTop: '1px solid #D2D2D2' }}>
            <label htmlFor="fromDateFilter" className="w-[100px] h-[50px] px-3 py-1.5 bg-[#EDF6FF] flex items-center text-[14px] font-semibold text-[#010101] tracking-[-0.35px] flex-shrink-0">
              기간
            </label>
            <div className="flex items-center gap-2 px-3">
              <TextField
                id="fromDateFilter"
                type="date"
                placeholder="시작일"
                value={fromDateFilter}
                onChange={(e) => setFromDateFilter(e.target.value)}
                className="w-[160px]"
                style={{ height: '36px', minHeight: '36px', maxHeight: '36px' }}
              />
              <span className="text-[14px] text-[#646F7C]">~</span>
              <TextField
                id="toDateFilter"
                type="date"
                placeholder="종료일"
                value={toDateFilter}
                onChange={(e) => setToDateFilter(e.target.value)}
                className="w-[160px]"
                style={{ height: '36px', minHeight: '36px', maxHeight: '36px' }}
              />
            </div>

            <label htmlFor="statusFilter" className="w-[100px] h-[50px] px-3 py-1.5 bg-[#EDF6FF] flex items-center text-[14px] font-semibold text-[#010101] tracking-[-0.35px] flex-shrink-0">
              상태
            </label>
            <div className="px-3">
              <Select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="w-[200px]"
                style={{ height: '36px', minHeight: '36px', maxHeight: '36px' }}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Second Row: 검색 (셀렉트) | 검색어 입력 | 조회 | 초기화 */}
          <div className="flex items-center gap-3" style={{ borderTop: '1px solid #D2D2D2', borderBottom: '1px solid #D2D2D2' }}>
            <label htmlFor="searchFieldType" className="w-[100px] h-[50px] px-3 py-1.5 bg-[#EDF6FF] flex items-center text-[14px] font-semibold text-[#010101] tracking-[-0.35px] flex-shrink-0">
              검색
            </label>
            <Select
              id="searchFieldType"
              value={searchFieldType}
              onChange={(e) => setSearchFieldType(e.target.value as SearchFieldType)}
              className="w-[180px]"
              style={{ height: '36px', minHeight: '36px', maxHeight: '36px' }}
            >
              <option value="periodNumber">기수</option>
              <option value="ownerName">건축주</option>
              <option value="region">건축위치</option>
            </Select>

            <TextField
              placeholder="검색어를 입력하세요"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="flex-1"
              style={{ height: '36px', minHeight: '36px', maxHeight: '36px' }}
            />

            <Button type="submit" className="w-[100px] text-[14px] font-medium leading-[1.4] tracking-[-0.28px] text-white" style={{ height: '36px' }}>
              조회
            </Button>
            <Button type="button" variant="secondary" onClick={handleReset} className="w-[100px] text-[14px] font-medium leading-[1.4] tracking-[-0.28px] rounded-[4px]" style={{ height: '36px', backgroundColor: '#E9EBEE', color: '#646F7C' }}>
              초기화
            </Button>
          </div>
        </div>
        </form>
      </div>

      {/* Action Bar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <span style={{
            color: '#010101',
            fontSize: '18px',
            fontWeight: 500,
            lineHeight: 'normal',
            letterSpacing: '-0.45px',
          }}>
            총 게시물
          </span>
          <span style={{
            color: '#0082FF',
            fontSize: '16px',
            fontWeight: 500,
            lineHeight: 'normal',
            letterSpacing: '-0.4px',
            marginLeft: '8px',
          }}>
            {totalElements}
          </span>
          <span style={{
            color: '#010101',
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: 'normal',
            letterSpacing: '-0.4px',
          }}>
            건
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              toast.info('엑셀 다운로드 기능은 준비중입니다.');
            }}
            className="flex items-center gap-[10px]"
            style={{
              width: 'auto',
              flexShrink: 0,
              height: '36px',
              minHeight: '36px',
              maxHeight: '36px',
              borderRadius: '5px',
              border: '1px solid #186F3D',
              background: '#FFF',
              padding: '5px 10px',
              color: '#186F3D',
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '140%',
              letterSpacing: '-0.35px',
              whiteSpace: 'nowrap',
            }}
          >
            <Image src="/assets/landing/Group 3019.svg" alt="" width={18} height={18} />
            엑셀 다운로드
          </Button>
          <Select
            value={pageSize.toString()}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(0);
            }}
            style={{ height: '36px', minHeight: '36px', maxHeight: '36px', width: '120px' }}
          >
            <option value="10">10개씩 보기</option>
            <option value="20">20개씩 보기</option>
            <option value="50">50개씩 보기</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="w-full overflow-hidden">
          <table className="min-w-full border-collapse text-sm">
            <caption className="sr-only">감리 작업 현황 목록</caption>
            <thead className="bg-[#EDF6FF]">
              <tr className="h-12">
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '60px' }}>NO</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '65px' }}>기수</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '120px' }}>접수번호</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '100px' }}>건축주</th>
                <th className="px-5 text-left text-[14px] font-semibold text-[#010101]">건축위치</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '100px' }}>규모</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '130px' }}>추천일자</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '130px' }}>진행상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-neutral/70 text-[14px] text-heading">
              {isLoading && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-secondary">
                    불러오는 중...
                  </td>
                </tr>
              )}

              {!isLoading && requests.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-secondary">
                    조회된 요청이 없습니다.
                  </td>
                </tr>
              )}

              {!isLoading &&
                requests.map((request) => (
                  <tr
                    key={request.id}
                    onClick={() => handleRowClick(request.id)}
                    className="bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-5 py-4 align-middle text-center text-secondary">
                      {request.id}
                    </td>
                    <td className="px-5 py-4 align-middle text-center text-secondary">
                      {request.periodNumber ? `${request.periodNumber}기` : '-'}
                    </td>
                    <td className="px-5 py-4 align-middle text-center text-secondary">
                      {request.requestNumber || '-'}
                    </td>
                    <td className="px-5 py-4 align-middle text-center">
                      {request.ownerName || '-'}
                    </td>
                    <td className="px-5 py-4 align-middle text-left">
                      <span className="text-[15px] font-semibold text-heading">
                        {request.siteAddress || request.siteDetailAddress || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle text-center">
                      -
                    </td>
                    <td className="px-5 py-4 align-middle text-center text-secondary">
                      {formatDate(request.designationDate || request.supervisorAssignedAt)}
                    </td>
                    <td className="px-5 py-4 align-middle text-center">
                      <span className={getDemolitionStatusBadge(request.status)} style={{ display: 'inline-block', width: '88px', textAlign: 'center', padding: '8px 12px', borderRadius: '4px' }}>
                        {getInspectorDemolitionStatusLabel(request.status)}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
      />
    </div>
  );
}
