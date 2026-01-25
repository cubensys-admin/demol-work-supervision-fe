'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { Recruitment } from '@/entities/recruitment/model/types';
import { getRecruitmentStatusBadge, getRecruitmentStatusLabel } from '@/entities/recruitment/model/status';
import { formatDate } from '@/shared/lib/date';
import { env } from '@/shared/config/env';
import { Button } from '@/shared/ui/button';
import { classNames } from '@/shared/lib/classNames';
import { useAuthStore } from '@/shared/model/authStore';

interface RecruitmentDetailViewProps {
  recruitment: Recruitment;
}

export function RecruitmentDetailView({ recruitment }: RecruitmentDetailViewProps) {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);

  // Convert relative image URLs in content to absolute URLs
  const processedContent = recruitment.content.replace(
    /src="(\/api\/recruitments\/ckeditor\/assets[^"]*)"/g,
    (match, url) => `src="${env.apiBaseUrl}${url}"`
  );

  // Check if application period is open
  const now = new Date();
  const startDate = new Date(recruitment.startDate);
  const endDate = new Date(recruitment.endDate);
  const isApplicationOpen = now >= startDate && now <= endDate && recruitment.status === 'RECRUITING';
  const canApply = role === 'INSPECTOR' && isApplicationOpen;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                {recruitment.periodNumber ?? '-'}기
              </span>
              <span className={classNames(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                getRecruitmentStatusBadge(recruitment.status)
              )}>
                {getRecruitmentStatusLabel(recruitment.status)}
              </span>
            </div>
            <h1 className="text-2xl font-semibold mb-2">{recruitment.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-secondary">
              <span>모집기간: {formatDate(recruitment.startDate)} ~ {formatDate(recruitment.endDate)}</span>
              {recruitment.createdAt && (
                <span>작성일: {formatDate(recruitment.createdAt)}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/recruitments-manage/recruitments')}
            >
              목록
            </Button>
            {canApply && (
              <Button 
                type="button"
                onClick={() => router.push('/applicants-apply/apply')}
              >
                지원하기
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <h2 className="text-lg font-semibold mb-4">상세 내용</h2>
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </div>

      {/* Attachment */}
      {recruitment.attachmentName && recruitment.attachmentUrl && (
        <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-semibold mb-4">첨부파일</h2>
          <div className="flex items-center gap-2">
            <a
              href={recruitment.attachmentUrl}
              download={recruitment.attachmentName}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {recruitment.attachmentName}
            </a>
          </div>
        </div>
      )}

      {/* Apply Section for Inspectors */}
      {canApply && (
        <div className="rounded-[20px] bg-blue-50 px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">감리자 지원</h3>
              <p className="text-sm text-gray-600">
                현재 모집 중입니다. 지금 바로 지원해보세요!
              </p>
            </div>
            <Button 
              type="button"
              onClick={() => router.push('/applicants-apply/apply')}
            >
              지원하기
            </Button>
          </div>
        </div>
      )}
      
      {/* Login Notice for Non-Inspectors */}
      {isApplicationOpen && role !== 'INSPECTOR' && (
        <div className="rounded-[20px] bg-gray-50 px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">감리자 지원 안내</h3>
              <p className="text-sm text-gray-600">
                감리자로 로그인 후 지원이 가능합니다.
              </p>
            </div>
            <Link href="/login">
              <Button type="button" variant="secondary">
                로그인
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
