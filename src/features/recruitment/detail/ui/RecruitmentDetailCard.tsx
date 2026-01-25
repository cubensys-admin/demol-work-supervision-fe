'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getPublicRecruitmentDetail, type RecruitmentDetail } from '@/shared/api/public';
import { getRecruitmentById } from '@/entities/recruitment/api/getRecruitmentById';
import type { Recruitment } from '@/entities/recruitment/model/types';
import { deleteRecruitment } from '@/features/recruitment/manage/api/deleteRecruitment';
import { useAuthStore, type UserRole } from '@/shared/model/authStore';
import { formatDate } from '@/shared/lib/date';
import { Button } from '@/shared/ui/button';
import { env } from '@/shared/config/env';

const ALLOWED_ROLES: UserRole[] = ['CITY_HALL', 'ARCHITECT_SOCIETY'];

interface RecruitmentDetailCardProps {
  id: number;
  isManageMode?: boolean;
}

export function RecruitmentDetailCard({ id, isManageMode = false }: RecruitmentDetailCardProps) {
  const role = useAuthStore((state) => state.role);
  const hydrate = useAuthStore((state) => state.hydrate);
  const router = useRouter();
  const [recruitment, setRecruitment] = useState<RecruitmentDetail | Recruitment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthorized = role ? ALLOWED_ROLES.includes(role) : false;
  const showManageButtons = isManageMode && isAuthorized;
  const listPath = isManageMode ? '/recruitments-manage' : '/recruitments';

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const fetchRecruitment = async () => {
      try {
        let data;
        if (isManageMode) {
          data = await getRecruitmentById(id);
        } else {
          data = await getPublicRecruitmentDetail(id);
        }
        setRecruitment(data);
      } catch (error) {
        console.error(error);
        toast.error('모집공고를 불러오는 중 오류가 발생했습니다.');
        router.push(listPath);
      } finally {
        setIsLoading(false);
      }
    };

    if (isManageMode && !isAuthorized) {
      setIsLoading(false);
      return;
    }

    fetchRecruitment();
  }, [id, router, listPath, isManageMode, isAuthorized]);

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 모집공고를 삭제하시겠습니까?')) return;

    setIsDeleting(true);
    try {
      await deleteRecruitment(id);
      toast.success('모집공고가 삭제되었습니다.');
      router.push(listPath);
    } catch (error) {
      console.error(error);
      toast.error('모집공고 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isManageMode && !isAuthorized) {
    return (
      <div className="rounded-[20px] bg-[#FFF5F5] px-6 py-12 text-center text-red-600 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        모집공고 관리는 시청 또는 건축사회 계정만 이용할 수 있습니다.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-[20px] bg-white px-6 py-12 text-center text-secondary shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        불러오는 중...
      </div>
    );
  }

  if (!recruitment) {
    return (
      <div className="rounded-[20px] bg-white px-6 py-12 text-center text-secondary shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        모집공고를 찾을 수 없습니다.
      </div>
    );
  }

  // For manage mode, cast to Recruitment type to access management fields
  const managementRecruitment = isManageMode ? (recruitment as Recruitment) : null;

  // Convert relative image URLs in content to absolute URLs (manage mode only)
  const processedContent = isManageMode && managementRecruitment
    ? managementRecruitment.content.replace(
        /src="(\/api\/recruitments\/ckeditor\/assets[^"]*)"/g,
        (match, url) => `src="${env.apiBaseUrl}${url}"`
      )
    : recruitment.content;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold mb-3">{recruitment.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-secondary">
              {recruitment.createdByUsername && (
                <span>작성자: {recruitment.createdByUsername}</span>
              )}
              <span>작성일: {formatDate(recruitment.createdAt)}</span>
              {showManageButtons && managementRecruitment?.updatedAt && (
                <span>수정일: {formatDate(managementRecruitment.updatedAt)}</span>
              )}
              <span>조회수: {recruitment.viewCount ?? 0}</span>
              <span>모집기간: {formatDate(recruitment.startDate)} ~ {formatDate(recruitment.endDate)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push(listPath)}
            >
              목록
            </Button>
            {showManageButtons && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push(`${listPath}/${id}/edit`)}
                >
                  수정
                </Button>
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <h2 className="text-lg font-semibold mb-4">{isManageMode ? '상세 내용' : '공고 내용'}</h2>
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </div>

      {/* Attachments */}
      {recruitment.attachments && recruitment.attachments.length > 0 && (
        <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-semibold mb-4">첨부파일</h2>
          <div className="space-y-2">
            {recruitment.attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <p className="text-sm font-medium">{attachment.fileName}</p>
                </div>
                <a
                  href={`${env.apiBaseUrl}/api/recruitments/attachments/${attachment.id}`}
                  download
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  다운로드
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Actions - manage mode only */}
      {showManageButtons && (
        <div className="flex justify-center gap-3 py-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(listPath)}
          >
            목록으로
          </Button>
          <Button
            type="button"
            onClick={() => router.push(`${listPath}/${id}/edit`)}
          >
            수정하기
          </Button>
        </div>
      )}
    </div>
  );
}
