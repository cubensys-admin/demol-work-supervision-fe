interface ComingSoonProps {
  title?: string;
  description?: string;
}

export function ComingSoon({
  title = "페이지 준비중",
  description = "해당 기능은 현재 개발 중입니다."
}: ComingSoonProps) {
  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <div className="rounded-[20px] bg-white p-12 shadow-[2px_4px_20px_rgba(0,0,0,0.05)] text-center max-w-2xl">
        <div className="mb-6">
          <svg
            className="mx-auto h-24 w-24 text-primary/20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>

        <h1 className="text-[28px] font-bold text-heading mb-4">
          {title}
        </h1>

        <p className="text-[16px] text-secondary leading-relaxed mb-8">
          {description}
        </p>

        <div className="inline-flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-2 text-[14px] text-primary">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>서비스 준비 중입니다</span>
        </div>
      </div>
    </div>
  );
}
