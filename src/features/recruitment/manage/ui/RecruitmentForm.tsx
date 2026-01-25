'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getRecruitmentById } from '@/entities/recruitment/api/getRecruitmentById';
import { createRecruitment } from '@/features/recruitment/manage/api/createRecruitment';
import { updateRecruitment } from '@/features/recruitment/manage/api/updateRecruitment';
import { useAuthStore, type UserRole } from '@/shared/model/authStore';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { RichEditor } from '@/shared/ui/rich-editor';

const ALLOWED_ROLES: UserRole[] = ['CITY_HALL', 'ARCHITECT_SOCIETY'];

interface RecruitmentFormProps {
  mode: 'create' | 'edit';
  id?: number;
}

export function RecruitmentForm({ mode, id }: RecruitmentFormProps) {
  const role = useAuthStore((state) => state.role);
  const router = useRouter();
  
  const [form, setForm] = useState({
    title: '',
    content: '',
    startDate: '',
    endDate: '',
    executionStartDate: '',
    executionEndDate: '',
    attachment: null as File | null,
  });
  
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isAuthorized = role ? ALLOWED_ROLES.includes(role) : false;

  useEffect(() => {
    const fetchRecruitment = async () => {
      if (mode === 'edit' && id) {
        try {
          const data = await getRecruitmentById(id);
          setForm({
            title: data.title,
            content: data.content,
            startDate: data.startDate,
            endDate: data.endDate,
            executionStartDate: data.executionStartDate || '',
            executionEndDate: data.executionEndDate || '',
            attachment: null,
          });
        } catch (error) {
          console.error(error);
          toast.error('모집공고를 불러오는 중 오류가 발생했습니다.');
          router.push('/recruitments-manage');
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (isAuthorized) {
      fetchRecruitment();
    }
  }, [mode, id, isAuthorized, router]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content: string) => {
    setForm((prev) => ({ ...prev, content }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, attachment: file }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await createRecruitment(form);
        toast.success('모집공고가 등록되었습니다.');
      } else if (mode === 'edit' && id) {
        await updateRecruitment(id, form);
        toast.success('모집공고가 수정되었습니다.');
      }
      router.push('/recruitments-manage');
    } catch (error) {
      console.error(error);
      toast.error('모집공고 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthorized) {
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

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {mode === 'create' ? '모집공고 작성' : '모집공고 수정'}
            </h1>
            <p className="mt-1 text-sm text-secondary">
              {mode === 'create' 
                ? '새로운 모집공고를 작성합니다.' 
                : '모집공고 내용을 수정합니다.'}
            </p>
          </div>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => router.push('/recruitments-manage')}
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
                placeholder="모집공고 제목을 입력하세요"
                value={form.title}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
                  <span>등재신청기간</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="text-gray-500">~</span>
                  <Input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
                  <span>시행 기간</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="date"
                    name="executionStartDate"
                    value={form.executionStartDate}
                    onChange={handleInputChange}
                    required
                  />
                  <span className="text-gray-500">~</span>
                  <Input
                    type="date"
                    name="executionEndDate"
                    value={form.executionEndDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
                <span>상세 내용</span>
                <span className="text-red-500">*</span>
              </label>
              <RichEditor
                value={form.content}
                onChange={handleContentChange}
                placeholder="모집공고 상세 내용을 입력해 주세요"
                minHeight={400}
                uploadUrl="/api/recruitments/ckeditor/upload"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                첨부파일 (선택)
              </label>
              <Input 
                type="file" 
                accept=".pdf,.hwp" 
                onChange={handleFileChange} 
              />
              <p className="mt-1 text-xs text-secondary">
                PDF 또는 HWP 형식만 업로드 가능합니다.
                {mode === 'edit' && ' 새 파일을 업로드하지 않으면 기존 파일이 유지됩니다.'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3 py-6">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => router.push('/recruitments-manage')}
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
