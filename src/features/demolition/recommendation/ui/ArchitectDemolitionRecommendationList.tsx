'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { getArchitectDemolitionRequests } from '@/entities/demolition/api';
import type {
  DemolitionRequestStatus,
  DemolitionRequestSummary,
  DemolitionRequestType,
} from '@/entities/demolition/model/types';
import { getDemolitionStatusLabel, getDemolitionStatusBadge, getDemolitionTypeLabel } from '@/entities/demolition/model/status';
import { formatDate } from '@/shared/lib/date';
import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { Select } from '@/shared/ui/select';
import { Radio } from '@/shared/ui/radio';
import { Pagination } from '@/shared/ui/pagination';

const SEOUL_DISTRICTS = [
  '강남구', '강동구', '강북구', '강서구', '관악구',
  '광진구', '구로구', '금천구', '노원구', '도봉구',
  '동대문구', '동작구', '마포구', '서대문구', '서초구',
  '성동구', '성북구', '송파구', '양천구', '영등포구',
  '용산구', '은평구', '종로구', '중구', '중랑구',
] as const;

type AppliedFilters = {
  status?: DemolitionRequestStatus;
  requestType?: DemolitionRequestType;
  region?: string;
  ownerName?: string;
  supervisorName?: string;
  supervisorLicense?: string;
};

type SearchFieldType = 'ownerName' | 'supervisorName' | 'supervisorLicense';

/**
 * Architect Society Demolition Supervisor Assigned List
 * Shows only SUPERVISOR_ASSIGNED status demolition requests
 */
export function ArchitectDemolitionRecommendationList() {
  const router = useRouter();
  const [requests, setRequests] = useState<DemolitionRequestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<'ALL' | DemolitionRequestStatus>('ALL');
  const [requestTypeFilter, setRequestTypeFilter] = useState<'ALL' | DemolitionRequestType>('ALL');
  const [regionFilter, setRegionFilter] = useState<'ALL' | (typeof SEOUL_DISTRICTS)[number]>('ALL');
  const [searchFieldType, setSearchFieldType] = useState<SearchFieldType>('ownerName');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  const statusOptions = useMemo(() => {
    const overrides: Partial<Record<DemolitionRequestStatus, string>> = {
      INITIAL_REQUEST: '접수',
      VERIFICATION_REQUESTED: '가추천',
      VERIFICATION_COMPLETED: '검토완료',
      VERIFICATION_REJECTED: '재지정 요청',
      SUPERVISOR_ASSIGNED: '추천 완료',
      CANCELLED: '삭제',
    };

    const filteredStatuses: DemolitionRequestStatus[] = [
      'INITIAL_REQUEST',
      'INITIAL_REJECTED',
      'RE_REQUEST',
      'VERIFICATION_REQUESTED',
      'VERIFICATION_COMPLETED',
      'VERIFICATION_REJECTED',
      'SUPERVISOR_ASSIGNED',
      'SUPERVISOR_COMPLETED',
    ];

    return [
      { value: 'ALL', label: '전체 상태' },
      ...filteredStatuses.map((status) => ({
        value: status,
        label: overrides[status] ?? getDemolitionStatusLabel(status),
      })),
    ];
  }, []);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getArchitectDemolitionRequests({
        page: currentPage,
        size: pageSize,
        status: appliedFilters.status,
        requestType: appliedFilters.requestType,
        region: appliedFilters.region,
        ownerName: appliedFilters.ownerName,
        supervisorName: appliedFilters.supervisorName,
        supervisorLicense: appliedFilters.supervisorLicense,
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
      requestType: requestTypeFilter === 'ALL' ? undefined : requestTypeFilter,
      region: regionFilter === 'ALL' ? undefined : regionFilter,
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
    setRequestTypeFilter('ALL');
    setRegionFilter('ALL');
    setSearchFieldType('ownerName');
    setSearchKeyword('');
    setAppliedFilters({});
    setCurrentPage(0);
  };

  const handleRowClick = (id: number) => {
    router.push(`/architect/demolition/${id}`);
  };

  return (
    <div className="rounded-[20px] bg-white p-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[18px] font-bold">해체공사감리 현황</h1>
        <button
          type="button"
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
          aria-label={isFilterExpanded ? '필터 접기' : '필터 펼치기'}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transform transition-transform duration-300 ${isFilterExpanded ? 'rotate-180' : ''}`}
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
          {/* First Row: 요청유형 (라디오) | 상태 (셀렉트) | 건축위치 (셀렉트) */}
          <div className="flex items-center gap-2" style={{ borderTop: '1px solid #D2D2D2' }}>
            {/* Group 1: 요청유형 */}
            <div className="flex items-center gap-3 flex-1">
              <label className="w-[100px] h-[50px] px-3 py-1.5 bg-[#EDF6FF] flex items-center text-[14px] font-semibold text-[#010101] tracking-[-0.35px] flex-shrink-0">
                요청유형
              </label>
              <div className="flex items-center gap-4">
                <Radio
                  label="전체"
                  value="ALL"
                  name="requestType"
                  checked={requestTypeFilter === 'ALL'}
                  onChange={(e) => setRequestTypeFilter(e.target.value as typeof requestTypeFilter)}
                />
                <Radio
                  label="추천"
                  value="RECOMMENDATION"
                  name="requestType"
                  checked={requestTypeFilter === 'RECOMMENDATION'}
                  onChange={(e) => setRequestTypeFilter(e.target.value as typeof requestTypeFilter)}
                />
                <Radio
                  label="우선지정"
                  value="PRIORITY_DESIGNATION"
                  name="requestType"
                  checked={requestTypeFilter === 'PRIORITY_DESIGNATION'}
                  onChange={(e) => setRequestTypeFilter(e.target.value as typeof requestTypeFilter)}
                />
              </div>
            </div>

            {/* Group 2: 상태 */}
            <div className="flex items-center gap-3 flex-1">
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
            </div>

            {/* Group 3: 건축위치 */}
            <div className="flex items-center gap-3 flex-1">
              <label htmlFor="regionFilter" className="w-[100px] h-[50px] px-3 py-1.5 bg-[#EDF6FF] flex items-center text-[14px] font-semibold text-[#010101] tracking-[-0.35px] flex-shrink-0">
                건축위치
              </label>
              <Select
                id="regionFilter"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value as typeof regionFilter)}
                className="flex-1"
                style={{ height: '36px', minHeight: '36px', maxHeight: '36px' }}
              >
                <option value="ALL">전체 지역</option>
                {SEOUL_DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
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
              <option value="ownerName">건축주</option>
              <option value="supervisorName">감리자명</option>
              <option value="supervisorLicense">자격번호</option>
            </Select>

            <TextField
              placeholder="입력하세요"
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
          <span style={{ color: '#010101', fontSize: '18px', fontWeight: 500, lineHeight: 'normal', letterSpacing: '-0.45px' }}>총 게시물</span>
          <span style={{ color: '#0082FF', fontSize: '16px', fontWeight: 500, lineHeight: 'normal', letterSpacing: '-0.4px', marginLeft: '8px' }}>{totalElements}</span>
          <span style={{ color: '#010101', fontSize: '16px', fontWeight: 400, lineHeight: 'normal', letterSpacing: '-0.4px' }}>건</span>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => { toast.info('엑셀 다운로드 기능은 준비중입니다.'); }} className="flex items-center gap-[10px]" style={{ width: 'auto', flexShrink: 0, height: '36px', minHeight: '36px', maxHeight: '36px', borderRadius: '5px', border: '1px solid #186F3D', background: '#FFF', padding: '5px 10px', color: '#186F3D', fontSize: '14px', fontWeight: 600, lineHeight: '140%', letterSpacing: '-0.35px', whiteSpace: 'nowrap' }}>
            <Image src="/assets/landing/Group 3019.svg" alt="" width={18} height={18} />
            엑셀 다운로드
          </Button>
          <Select value={pageSize.toString()} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }} style={{ height: '36px', minHeight: '36px', maxHeight: '36px', width: '120px' }}>
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
            <caption className="sr-only">감리자 지정 목록</caption>
            <thead className="bg-[#EDF6FF]">
              <tr className="h-12">
                <th className="px-5 text-left text-[14px] font-semibold text-[#010101]">No.</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '65px' }}>기수</th>
                <th className="px-5 text-left text-[14px] font-semibold text-[#010101]">요청번호</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '130px' }}>요청일</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]">지정일</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '90px' }}>요청타입</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]">건축위치</th>
                <th className="px-5 text-left text-[14px] font-semibold text-[#010101]">감리자</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '130px' }}>상태</th>
                <th className="px-5 text-right text-[14px] font-semibold text-[#010101]">실적회비</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-neutral/70 text-[14px] text-heading">
              {isLoading && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-secondary">
                    불러오는 중...
                  </td>
                </tr>
              )}

              {!isLoading && requests.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-secondary">
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
                    <td className="px-5 py-4 align-middle text-center text-secondary">
                      {request.periodNumber ? `${request.periodNumber}기` : '-'}
                    </td>
                    <td className="px-5 py-4 align-middle text-left">
                      <span className="text-[15px] font-semibold text-heading">
                        {request.requestNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle text-center text-secondary">
                      {formatDate(request.requestDate)}
                    </td>
                    <td className="px-5 py-4 align-middle text-center text-secondary">
                      {request.designationDate ? formatDate(request.designationDate) : '-'}
                    </td>
                    <td className="px-5 py-4 align-middle text-center">
                      {getDemolitionTypeLabel(request.requestType)}
                    </td>
                    <td className="px-5 py-4 align-middle text-center">
                      {request.region || '-'}
                    </td>
                    <td className="px-5 py-4 align-middle text-left">
                      {request.supervisorName || '-'}
                    </td>
                    <td className="px-5 py-4 align-middle text-center">
                      <span className={getDemolitionStatusBadge(request.status)} style={{ display: 'inline-block', width: '88px', textAlign: 'center', padding: '8px 12px', borderRadius: '4px' }}>
                        {getDemolitionStatusLabel(request.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle text-right">
                      {request.associationFee != null
                        ? `${request.associationFee.toLocaleString()}원`
                        : '-'}
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
