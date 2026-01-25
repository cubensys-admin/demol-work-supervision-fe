'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  // Ensure at least 1 page is shown
  const displayTotalPages = Math.max(totalPages, 1);

  return (
    <div className="mt-6 flex items-center justify-center gap-1">
      {/* 맨 앞으로 */}
      <button
        type="button"
        disabled={currentPage === 0 || isLoading}
        onClick={() => onPageChange(0)}
        className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>

      {/* 이전 */}
      <button
        type="button"
        disabled={currentPage === 0 || isLoading}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* 페이지 번호들 */}
      {Array.from({ length: displayTotalPages }, (_, i) => i)
        .filter((pageNum) => {
          // 최대 10개 페이지 번호 표시
          if (displayTotalPages <= 10) return true;

          // 10개 범위 계산
          let start: number;
          let end: number;

          if (currentPage < 5) {
            start = 0;
            end = 9;
          } else if (currentPage > displayTotalPages - 6) {
            start = displayTotalPages - 10;
            end = displayTotalPages - 1;
          } else {
            start = currentPage - 4;
            end = currentPage + 5;
          }

          return pageNum >= start && pageNum <= end;
        })
        .map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            disabled={isLoading}
            className={`flex h-8 w-8 items-center justify-center rounded border text-sm font-medium ${
              pageNum === currentPage
                ? 'border-[#0D77DE] bg-[#0D77DE] text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {pageNum + 1}
          </button>
        ))}

      {/* 다음 */}
      <button
        type="button"
        disabled={currentPage >= displayTotalPages - 1 || isLoading}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 맨 끝으로 */}
      <button
        type="button"
        disabled={currentPage >= displayTotalPages - 1 || isLoading}
        onClick={() => onPageChange(displayTotalPages - 1)}
        className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
