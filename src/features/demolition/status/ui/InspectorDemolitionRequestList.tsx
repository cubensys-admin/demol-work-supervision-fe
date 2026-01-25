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
import { getInspectorDemolitionStatusLabel, getDemolitionStatusBadge, getDemolitionTypeLabel } from '@/entities/demolition/model/status';
import { formatDate } from '@/shared/lib/date';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { Select } from '@/shared/ui/select';
import { Pagination } from '@/shared/ui/pagination';

const SEOUL_DISTRICTS = [
  '강남구', '강동구', '강북구', '강서구', '관악구',
  '광진구', '구로구', '금천구', '노원구', '도봉구',
  '동대문구', '동작구', '마포구', '서대문구', '서초구',
  '성동구', '성북구', '송파구', '양천구', '영등포구',
  '용산구', '은평구', '종로구', '중구', '중랑구',
] as const;

const ZONE_OPTIONS = ['ALL', '서북권', '동북권', '동남권', '서남권'] as const;

const ZONE_DISTRICTS: Record<string, readonly string[]> = {
  ALL: SEOUL_DISTRICTS,
  서북권: ['종로구', '중구', '용산구', '은평구', '서대문구', '마포구'],
  동북권: ['성동구', '광진구', '동대문구', '중랑구', '성북구', '강북구', '도봉구', '노원구'],
  동남권: ['서초구', '강남구', '송파구', '강동구'],
  서남권: ['양천구', '강서구', '구로구', '금천구', '영등포구', '동작구', '관악구'],
};

type AppliedFilters = {
  status?: DemolitionRequestStatus;
  region?: string;
  zone?: string;
  fromDate?: string;
  toDate?: string;
};

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
  const [regionFilter, setRegionFilter] = useState<'ALL' | (typeof SEOUL_DISTRICTS)[number]>('ALL');
  const [zoneFilter, setZoneFilter] = useState<(typeof ZONE_OPTIONS)[number]>('ALL');
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [toDateFilter, setToDateFilter] = useState('');
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

  const availableDistricts = useMemo(() => {
    return ZONE_DISTRICTS[zoneFilter] || SEOUL_DISTRICTS;
  }, [zoneFilter]);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getInspectorDemolitionRequests({
        page: currentPage,
        size: pageSize,
        status: appliedFilters.status,
        region: appliedFilters.region,
        zone: appliedFilters.zone,
        fromDate: appliedFilters.fromDate,
        toDate: appliedFilters.toDate,
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

  useEffect(() => {
    // 권역이 변경되면 지역 필터를 초기화 (현재 선택된 지역이 새 권역에 없으면)
    if (regionFilter !== 'ALL' && !availableDistricts.includes(regionFilter)) {
      setRegionFilter('ALL');
    }
  }, [zoneFilter, regionFilter, availableDistricts]);

  const handleApplyFilters = (event: FormEvent) => {
    event.preventDefault();
    setAppliedFilters({
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      region: regionFilter === 'ALL' ? undefined : regionFilter,
      zone: zoneFilter === 'ALL' ? undefined : zoneFilter,
      fromDate: fromDateFilter || undefined,
      toDate: toDateFilter || undefined,
    });
    setCurrentPage(0);
  };

  const handleReset = () => {
    setStatusFilter('ALL');
    setRegionFilter('ALL');
    setZoneFilter('ALL');
    setFromDateFilter('');
    setToDateFilter('');
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
          {/* First Row: 기간 (날짜 범위) */}
          <div className="flex items-center gap-3" style={{ borderTop: '1px solid #D2D2D2' }}>
            <label htmlFor="fromDateFilter" className="w-[100px] h-[50px] px-3 py-1.5 bg-[#EDF6FF] flex items-center text-[14px] font-semibold text-[#010101] tracking-[-0.35px] flex-shrink-0">
              기간
            </label>
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

          {/* Second Row: 상태 | 권역 | 지역 | 조회 | 초기화 */}
          <div className="flex items-center gap-3" style={{ borderTop: '1px solid #D2D2D2', borderBottom: '1px solid #D2D2D2' }}>
            <label htmlFor="statusFilter" className="w-[100px] h-[50px] px-3 py-1.5 bg-[#EDF6FF] flex items-center text-[14px] font-semibold text-[#010101] tracking-[-0.35px] flex-shrink-0">
              상태
            </label>
            <Select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="flex-1"
              style={{ height: '36px', minHeight: '36px', maxHeight: '36px' }}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <label htmlFor="zoneFilter" className="w-[100px] h-[50px] px-3 py-1.5 bg-[#EDF6FF] flex items-center text-[14px] font-semibold text-[#010101] tracking-[-0.35px] flex-shrink-0">
              권역
            </label>
            <Select
              id="zoneFilter"
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value as typeof zoneFilter)}
              className="flex-1"
              style={{ height: '36px', minHeight: '36px', maxHeight: '36px' }}
            >
              {ZONE_OPTIONS.map((zone) => (
                <option key={zone} value={zone}>
                  {zone === 'ALL' ? '전체 권역' : zone}
                </option>
              ))}
            </Select>

            <label htmlFor="regionFilter" className="w-[100px] h-[50px] px-3 py-1.5 bg-[#EDF6FF] flex items-center text-[14px] font-semibold text-[#010101] tracking-[-0.35px] flex-shrink-0">
              지역
            </label>
            <Select
              id="regionFilter"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value as typeof regionFilter)}
              className="flex-1"
              style={{ height: '36px', minHeight: '36px', maxHeight: '36px' }}
            >
              <option value="ALL">전체 지역</option>
              {availableDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </Select>

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
                <th className="px-5 text-left text-[14px] font-semibold text-[#010101]">No.</th>
                <th className="px-5 text-left text-[14px] font-semibold text-[#010101]">주소</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '65px' }}>기수</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '130px' }}>요청일</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '90px' }}>요청타입</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '90px' }}>구청</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '80px' }}>지역</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '80px' }}>권역</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '130px' }}>상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-neutral/70 text-[14px] text-heading">
              {isLoading && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-secondary">
                    불러오는 중...
                  </td>
                </tr>
              )}

              {!isLoading && requests.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-secondary">
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
                    <td className="px-5 py-4 align-middle text-left text-secondary">
                      {request.id}
                    </td>
                    <td className="px-5 py-4 align-middle text-left">
                      <span className="text-[15px] font-semibold text-heading">
                        {request.siteDetailAddress || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle text-center text-secondary">
                      {request.periodNumber ? `${request.periodNumber}기` : '-'}
                    </td>
                    <td className="px-5 py-4 align-middle text-center text-secondary">
                      {formatDate(request.requestDate)}
                    </td>
                    <td className="px-5 py-4 align-middle text-center">
                      {getDemolitionTypeLabel(request.requestType)}
                    </td>
                    <td className="px-5 py-4 align-middle text-center">
                      {request.districtOffice || '-'}
                    </td>
                    <td className="px-5 py-4 align-middle text-center">
                      {request.region || '-'}
                    </td>
                    <td className="px-5 py-4 align-middle text-center">
                      {request.zone || '-'}
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
