'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getNoticeById } from '@/entities/notice/api/getNoticeById';
import { createNotice } from '@/features/notice/manage/api/createNotice';
import { updateNotice } from '@/features/notice/manage/api/updateNotice';
import { useAuthStore, type UserRole } from '@/shared/model/authStore';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { RichEditor } from '@/shared/ui/rich-editor';

const ALLOWED_ROLES: UserRole[] = ['ARCHITECT_SOCIETY'];

interface NoticeFormProps {
  mode: 'create' | 'edit';
  id?: number;
}

export function NoticeForm({ mode, id }: NoticeFormProps) {
  const role = useAuthStore((state) => state.role);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    content: '',
    pinned: false,
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<{
    id: number;
    fileName: string;
    fileSize: number;
  }[]>([]);
  const [retainAttachmentIds, setRetainAttachmentIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthorized = role ? ALLOWED_ROLES.includes(role) : false;

  useEffect(() => {
    const fetchNotice = async () => {
      if (mode === 'edit' && id) {
        try {
          const data = await getNoticeById(id);
          setForm({
            title: data.title,
            content: data.content,
            pinned: data.pinned,
          });
          const attachmentList = data.attachments || [];
          setExistingAttachments(attachmentList);
          setRetainAttachmentIds(attachmentList.map(att => att.id));
        } catch (error) {
          console.error(error);
          toast.error('공지사항을 불러오는 중 오류가 발생했습니다.');
          router.push('/notices-manage');
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (isAuthorized) {
      fetchNotice();
    }
  }, [mode, id, isAuthorized, router]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (content: string) => {
    setForm((prev) => ({ ...prev, content }));
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
    // input 값 초기화는 다음 틱에서 실행 (state 업데이트 후)
    requestAnimationFrame(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    });
  };

  const handleRemoveNewAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingAttachment = (attachmentId: number) => {
    if (!window.confirm('해당 첨부파일을 삭제하시겠습니까?')) {
      return;
    }
    setRetainAttachmentIds(prev => prev.filter(id => id !== attachmentId));
    setExistingAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!form.title.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    if (!form.content.trim()) {
      toast.error('내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await createNotice({
          title: form.title,
          content: form.content,
          pinned: form.pinned,
          attachments: attachments,
        });
        toast.success('공지사항이 등록되었습니다.');
      } else if (mode === 'edit' && id) {
        await updateNotice(id, {
          title: form.title,
          content: form.content,
          pinned: form.pinned,
          retainAttachmentIds: retainAttachmentIds,
          attachments: attachments,
        });
        toast.success('공지사항이 수정되었습니다.');
      }
      router.push('/notices-manage');
    } catch (error) {
      console.error(error);
      toast.error('공지사항 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isAuthorized) {
    return (
      <div className="rounded-[20px] bg-[#FFF5F5] px-6 py-12 text-center text-red-600 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        공지사항 관리는 건축사협회 계정만 이용할 수 있습니다.
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

  const totalAttachments = existingAttachments.length + attachments.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {mode === 'create' ? '공지사항 등록' : '공지사항 수정'}
            </h1>
            <p className="mt-1 text-sm text-secondary">
              {mode === 'create'
                ? '새로운 공지사항을 등록합니다.'
                : '공지사항 내용을 수정합니다.'}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/notices-manage')}
          >
            목록으로
          </Button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <div className="space-y-6">
            <div>
              <label className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
                <span>제목</span>
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="title"
                placeholder="공지사항 제목을 입력하세요"
                value={form.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="pinned"
                  checked={form.pinned}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  고정 공지로 설정
                </span>
                <span className="text-xs text-gray-500">
                  (목록 상단에 고정됩니다)
                </span>
              </label>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
                <span>내용</span>
                <span className="text-red-500">*</span>
              </label>
              <RichEditor
                value={form.content}
                onChange={handleContentChange}
                placeholder="공지사항 내용을 입력해 주세요"
                minHeight={400}
                uploadUrl="/api/notices/ckeditor/upload"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                첨부파일
              </label>

              {/* 숨겨진 파일 input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.hwp,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* 파일 선택 버튼 */}
              <button
                type="button"
                onClick={handleFileButtonClick}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                파일 선택
              </button>
              <p className="mt-2 text-xs text-secondary">
                여러 파일을 선택할 수 있습니다. 추가 선택 시 기존 파일에 추가됩니다.
              </p>

              {/* 첨부파일 목록 */}
              {totalAttachments > 0 && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-3 text-sm font-medium text-gray-700">
                    첨부된 파일 ({totalAttachments}개)
                  </p>
                  <div className="space-y-2">
                    {/* 기존 첨부파일 */}
                    {existingAttachments.map((attachment) => (
                      <div
                        key={`existing-${attachment.id}`}
                        className="flex items-center justify-between rounded-md bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100">
                            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{attachment.fileName}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingAttachment(attachment.id)}
                          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
                          title="삭제"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    {/* 새 첨부파일 */}
                    {attachments.map((file, index) => (
                      <div
                        key={`new-${index}-${file.name}`}
                        className="flex items-center justify-between rounded-md bg-blue-50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-100">
                            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                                새 파일
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewAttachment(index)}
                          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-blue-100 hover:text-red-500"
                          title="삭제"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3 py-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/notices-manage')}
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? (mode === 'create' ? '등록 중...' : '수정 중...')
              : (mode === 'create' ? '등록하기' : '수정하기')}
          </Button>
        </div>
      </form>
    </div>
  );
}
