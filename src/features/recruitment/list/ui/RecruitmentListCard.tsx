'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';

import { getPublicRecruitments } from '@/shared/api/public';
import type { RecruitmentSummary } from '@/shared/api/public';
import { getRecruitments } from '@/entities/recruitment/api/getRecruitments';
import type { Recruitment } from '@/entities/recruitment/model/types';
import { deleteRecruitment } from '@/features/recruitment/manage/api/deleteRecruitment';
import { useAuthStore, type UserRole } from '@/shared/model/authStore';
import { formatDate } from '@/shared/lib/date';
import { Button } from '@/shared/ui/button';
import { Select } from '@/shared/ui/select';
import { TextField } from '@/shared/ui/text-field';
import { Pagination } from '@/shared/ui/pagination';

const ALLOWED_ROLES: UserRole[] = ['CITY_HALL', 'ARCHITECT_SOCIETY'];

type AppliedFilters = {
  title?: string;
  author?: string;
  content?: string;
  createdFrom?: string;
  createdTo?: string;
};

type SearchFieldType = 'title' | 'author' | 'content';

interface RecruitmentListCardProps {
  isManageMode?: boolean;
  onDelete?: (id: number) => Promise<void>;
}

export function RecruitmentListCard({ isManageMode = false, onDelete }: RecruitmentListCardProps) {
  const role = useAuthStore((state) => state.role);
  const hydrate = useAuthStore((state) => state.hydrate);
  const router = useRouter();

  const [items, setItems] = useState<(RecruitmentSummary | Recruitment)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filter states
  const [searchFieldType, setSearchFieldType] = useState<SearchFieldType>('title');
  const [searchKeyword, setSearchKeyword] = useState("");
  const [createdFromFilter, setCreatedFromFilter] = useState("");
  const [createdToFilter, setCreatedToFilter] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  const isAuthorized = role ? ALLOWED_ROLES.includes(role) : false;
  const showManageButtons = isManageMode && isAuthorized;

  const fetchRecruitments = useCallback(async (pageNum: number = 0) => {
    setIsLoading(true);
    try {
      let response;
      if (isManageMode) {
        response = await getRecruitments({ page: pageNum, size: pageSize, ...appliedFilters });
      } else {
        response = await getPublicRecruitments({ page: pageNum, size: pageSize, ...appliedFilters });
      }
      setItems(response.content ?? []);
      setPage(response.number ?? pageNum);
      setTotalPages(response.totalPages ?? 0);
      setTotalElements(response.totalElements ?? 0);
    } catch (error) {
      console.error(error);
      toast.error('모집공고 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [isManageMode, pageSize, appliedFilters]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isManageMode && !isAuthorized) {
      return;
    }
    fetchRecruitments(0);
  }, [fetchRecruitments, isManageMode, isAuthorized]);

  const handlePageChange = (newPage: number) => {
    fetchRecruitments(newPage);
  };

  const handleApplyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const filters: AppliedFilters = {};

    if (searchKeyword.trim()) {
      filters[searchFieldType] = searchKeyword.trim();
    }

    if (createdFromFilter) {
      filters.createdFrom = createdFromFilter;
    }

    if (createdToFilter) {
      filters.createdTo = createdToFilter;
    }

    setAppliedFilters(filters);
    setPage(0);
  };

  const handleReset = () => {
    setSearchFieldType('title');
    setSearchKeyword("");
    setCreatedFromFilter("");
    setCreatedToFilter("");
    setAppliedFilters({});
    setPage(0);
  };

  const handleDelete = async (id: number) => {
    if (!onDelete) {
      // Default delete handler
      if (!window.confirm('해당 모집공고를 삭제하시겠습니까?')) return;

      try {
        await deleteRecruitment(id);
        toast.success('모집공고를 삭제했습니다.');

        // 현재 페이지가 마지막 페이지이고 마지막 항목을 삭제한 경우 이전 페이지로 이동
        if (items.length === 1 && page > 0) {
          fetchRecruitments(page - 1);
        } else {
          fetchRecruitments(page);
        }
      } catch (error) {
        console.error(error);

        // HTTP 상태 코드에 따른 에러 메시지
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 403) {
          toast.error('모집공고를 삭제할 권한이 없습니다.');
        } else if (status === 404) {
          toast.error('모집공고를 찾을 수 없습니다.');
        } else {
          toast.error('모집공고 삭제에 실패했습니다.');
        }
      }
      return;
    }

    await onDelete(id);
    fetchRecruitments(page);
  };

  const handleRowClick = (id: number) => {
    const path = isManageMode ? `/recruitments-manage/${id}` : `/recruitments/${id}`;
    router.push(path);
  };

  if (isManageMode && !role) {
    return (
      <div className="rounded-[20px] bg-white px-6 py-12 text-center text-secondary shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        로그인 후 이용할 수 있습니다.
      </div>
    );
  }

  if (isManageMode && !isAuthorized) {
    return (
      <div className="rounded-[20px] bg-[#FFF5F5] px-6 py-12 text-center text-red-600 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        모집공고 관리는 시청 또는 건축사회 계정만 이용할 수 있습니다.
      </div>
    );
  }

  return (
    <div className="rounded-[20px] bg-white p-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[18px] font-bold">{isManageMode ? '공고 조회/등록' : '모집공고'}</h1>
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
          {/* First Row: 작성일 */}
          <div className="flex items-center gap-3" style={{ borderTop: '1px solid #D2D2D2' }}>
            <label htmlFor="createdFromFilter" className="w-[100px] h-[50px] px-3 py-1.5 bg-[#EDF6FF] flex items-center text-[14px] font-semibold text-[#010101] tracking-[-0.35px] flex-shrink-0">
              작성일
            </label>
            <TextField
              id="createdFromFilter"
              type="date"
              placeholder="시작일"
              value={createdFromFilter}
              onChange={(e) => setCreatedFromFilter(e.target.value)}
              className="w-[160px]"
              style={{ height: '36px', minHeight: '36px', maxHeight: '36px' }}
            />
            <span className="text-[14px] text-[#646F7C]">~</span>
            <TextField
              id="createdToFilter"
              type="date"
              placeholder="종료일"
              value={createdToFilter}
              onChange={(e) => setCreatedToFilter(e.target.value)}
              className="w-[160px]"
              style={{ height: '36px', minHeight: '36px', maxHeight: '36px' }}
            />
          </div>

          {/* Second Row: 검색 | 조회, 초기화 */}
          <div className="flex items-center gap-3" style={{ borderTop: '1px solid #D2D2D2', borderBottom: '1px solid #D2D2D2' }}>
            <label htmlFor="searchFieldType" className="w-[100px] h-[50px] px-3 py-1.5 bg-[#EDF6FF] flex items-center text-[14px] font-semibold text-[#010101] tracking-[-0.35px] flex-shrink-0">
              검색
            </label>
            <div className="flex-shrink-0" style={{ width: '100px', minWidth: '100px' }}>
              <Select
                id="searchFieldType"
                value={searchFieldType}
                onChange={(e) => setSearchFieldType(e.target.value as SearchFieldType)}
                style={{ height: '36px', minHeight: '36px', maxHeight: '36px' }}
              >
                <option value="title">제목</option>
                <option value="author">작성자</option>
                <option value="content">내용</option>
              </Select>
            </div>

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
          <Select value={pageSize.toString()} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }} style={{ height: '36px', minHeight: '36px', maxHeight: '36px', width: '120px' }}>
            <option value="10">10개씩 보기</option>
            <option value="20">20개씩 보기</option>
            <option value="50">50개씩 보기</option>
          </Select>
          {showManageButtons && role === 'ARCHITECT_SOCIETY' && (
            <Button type="button" onClick={() => router.push('/recruitments-manage/create')}>
              새 공고 작성
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="min-w-full overflow-hidden md:min-w-[960px] xl:min-w-[1080px]">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">모집공고 목록</caption>
            <thead className="bg-[#EDF6FF]">
              <tr className="h-12">
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]">No.</th>
                {isManageMode && <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '65px' }}>기수</th>}
                <th className="px-5 text-left text-[14px] font-semibold text-[#010101]">제목</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]">모집 기간</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]">조회수</th>
                <th className="px-5 text-center text-[14px] font-semibold text-[#010101]">작성자</th>
                {showManageButtons && <th className="px-5 text-center text-[14px] font-semibold text-[#010101]">관리</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-neutral/70 text-[14px] text-heading">
              {isLoading && (
                <tr>
                  <td
                    colSpan={isManageMode ? (showManageButtons ? 7 : 6) : (showManageButtons ? 6 : 5)}
                    className="px-4 py-12 text-center text-secondary"
                  >
                    불러오는 중...
                  </td>
                </tr>
              )}

              {!isLoading && items.length === 0 && (
                <tr>
                  <td
                    colSpan={isManageMode ? (showManageButtons ? 7 : 6) : (showManageButtons ? 6 : 5)}
                    className="px-4 py-12 text-center text-secondary"
                  >
                    등록된 모집공고가 없습니다.
                  </td>
                </tr>
              )}

              {!isLoading &&
                items.map((item) => {
                  const recruitment = item as Recruitment;

                  return (
                    <tr
                      key={item.id}
                      className="bg-white hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 align-middle text-center text-secondary">
                        {item.id}
                      </td>
                      {isManageMode && (
                        <td className="px-5 py-4 align-middle text-center text-secondary">
                          {recruitment.periodNumber ?? '-'}기
                        </td>
                      )}
                      <td className="px-5 py-4 align-middle">
                        <button
                          type="button"
                          onClick={() => handleRowClick(item.id)}
                          className="flex items-center gap-2 text-left text-[15px] font-semibold text-primary-600 underline-offset-2 hover:text-primary-500 hover:underline"
                        >
                          <span className="line-clamp-2 leading-snug text-heading">{item.title}</span>
                        </button>
                      </td>
                      <td className="px-5 py-4 align-middle text-center text-secondary">
                        {formatDate(item.startDate)} ~ {formatDate(item.endDate)}
                      </td>
                      <td className="px-5 py-4 align-middle text-center text-secondary">
                        {recruitment.viewCount ?? 0}
                      </td>
                      <td className="px-5 py-4 align-middle text-center text-secondary">
                        {recruitment.createdByUsername ?? '-'}
                      </td>
                      {showManageButtons && (
                        <td className="px-5 py-4 align-middle">
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => router.push(`/recruitments-manage/${item.id}/edit`)}
                            >
                              수정
                            </Button>
                            <Button type="button" size="sm" onClick={() => handleDelete(item.id)}>
                              삭제
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />
    </div>
  );
}
