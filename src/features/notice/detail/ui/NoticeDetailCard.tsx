'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getNoticeById } from '@/entities/notice/api/getNoticeById';
import type { Notice } from '@/entities/notice/model/types';
import { useAuthStore, type UserRole } from '@/shared/model/authStore';
import { formatDate } from '@/shared/lib/date';
import { Button } from '@/shared/ui/button';
import { env } from '@/shared/config/env';

const ALLOWED_ROLES: UserRole[] = ['ARCHITECT_SOCIETY'];

interface NoticeDetailCardProps {
  id: number;
  isManageMode?: boolean;
  onDelete?: (id: number) => Promise<void>;
}

export function NoticeDetailCard({ id, isManageMode = false, onDelete }: NoticeDetailCardProps) {
  const role = useAuthStore((state) => state.role);
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthorized = role ? ALLOWED_ROLES.includes(role) : false;
  const showManageButtons = isManageMode && isAuthorized;

  const listPath = isManageMode ? '/notices-manage' : '/notices';
  const editPath = isManageMode ? `/notices-manage/${id}/edit` : undefined;

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const data = await getNoticeById(id);
        setNotice(data);
      } catch (error) {
        console.error(error);
        toast.error('공지사항을 불러오는 중 오류가 발생했습니다.');
        router.push(listPath);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotice();
  }, [id, router, listPath]);

  const handleDelete = async () => {
    if (!onDelete) return;

    if (!window.confirm('이 공지사항을 삭제하시겠습니까?')) return;

    setIsDeleting(true);
    try {
      await onDelete(id);
      toast.success('공지사항이 삭제되었습니다.');
      router.push(listPath);
    } catch (error) {
      console.error(error);
      toast.error('공지사항 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[20px] bg-white px-6 py-12 text-center text-secondary shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        불러오는 중...
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="rounded-[20px] bg-white px-6 py-12 text-center text-secondary shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        공지사항을 찾을 수 없습니다.
      </div>
    );
  }

  // Convert relative image URLs in content to absolute URLs
  const processedContent = notice.content.replace(
    /src="(\/api\/notices\/ckeditor\/assets[^"]*)"/g,
    (match, url) => `src="${env.apiBaseUrl}${url}"`
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {notice.pinned && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16a1 1 0 11-2 0V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"/>
                  </svg>
                  고정 공지
                </span>
              )}
            </div>
            <h1 className="text-2xl font-semibold mb-3">{notice.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-secondary">
              <span>작성자: {notice.createdBy}</span>
              <span>작성일: {formatDate(notice.createdAt)}</span>
              {notice.updatedAt && (
                <span>수정일: {formatDate(notice.updatedAt)}</span>
              )}
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
            {showManageButtons && editPath && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push(editPath)}
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
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </div>

      {/* Attachments */}
      {notice.attachments && notice.attachments.length > 0 && (
        <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <h2 className="text-lg font-semibold mb-4">첨부파일</h2>
          <div className="space-y-2">
            {notice.attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <p className="text-sm font-medium">{attachment.fileName}</p>
                </div>
                <a
                  href={`${env.apiBaseUrl}/api/notices/attachments/${attachment.id}`}
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
    </div>
  );
}
