'use client';

import Link from "next/link";
import type { Recruitment } from "@/entities/recruitment/model/types";
import {
  getRecruitmentStatusBadge,
  getRecruitmentStatusLabel,
} from "@/entities/recruitment/model/status";
import { formatDate } from "@/shared/lib/date";
import { classNames } from "@/shared/lib/classNames";
import { useAuthStore } from "@/shared/model/authStore";

interface RecruitmentCardProps {
  recruitment: Recruitment;
}

export function RecruitmentCard({ recruitment }: RecruitmentCardProps) {
  const role = useAuthStore((state) => state.role);
  const hasAttachment = Boolean(recruitment.attachmentUrl);
  const statusLabel = getRecruitmentStatusLabel(recruitment.status);
  
  // Check if application period is open
  const now = new Date();
  const startDate = new Date(recruitment.startDate);
  const endDate = new Date(recruitment.endDate);
  const isApplicationOpen = now >= startDate && now <= endDate;
  const canApply = role === 'INSPECTOR' && isApplicationOpen && recruitment.status === 'RECRUITING';

  return (
    <article className="flex flex-col gap-5 rounded-[20px] border border-border-neutral bg-white p-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-primary">
            제 {recruitment.periodNumber}기 모집공고
          </div>
          <h2 className="mt-1 text-2xl font-semibold text-heading">
            {recruitment.title}
          </h2>
        </div>
        <span
          className={classNames(
            "inline-flex items-center rounded-full px-4 py-1 text-sm font-medium",
            getRecruitmentStatusBadge(recruitment.status),
          )}
        >
          {statusLabel}
        </span>
      </header>

      <dl className="grid gap-3 text-sm text-body/80 sm:grid-cols-2">
        <div>
          <dt className="text-secondary">모집 기간</dt>
          <dd className="mt-1 text-body">
            {formatDate(recruitment.startDate)} ~ {formatDate(recruitment.endDate)}
          </dd>
        </div>
        {recruitment.createdAt && (
          <div>
            <dt className="text-secondary">게시일</dt>
            <dd className="mt-1 text-body">{formatDate(recruitment.createdAt)}</dd>
          </div>
        )}
      </dl>

      <p className="text-base leading-relaxed text-body line-clamp-3">
        {recruitment.content}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2">
        {hasAttachment && recruitment.attachmentUrl && (
          <div className="flex flex-wrap gap-2">
            <a
              href={recruitment.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-border-light px-3 py-1 text-sm text-primary transition-colors hover:border-primary hover:bg-primary/5"
            >
              {recruitment.attachmentName ?? "첨부파일"}
            </a>
          </div>
        )}
        
        {canApply && (
          <Link
            href="/applicants-apply/apply"
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            지원하기
          </Link>
        )}
      </div>
    </article>
  );
}
