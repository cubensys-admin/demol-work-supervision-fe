'use client';

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getMyApplications } from '@/features/applicant/apply/api/getMyApplications';
import { submitApplicantWithdrawal } from '@/features/applicant/apply/api/submitApplicantWithdrawal';
import {
  getApplicantStatusBadge,
  getApplicantStatusLabel,
} from '@/entities/applicant/model/status';
import type { ApplicantDetail } from '@/entities/applicant/model/types';
import { useAuthStore } from '@/shared/model/authStore';
import { formatDate } from '@/shared/lib/date';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
export function InspectorApplicationStatus() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const hydrate = useAuthStore((state) => state.hydrate);

  const [applications, setApplications] = useState<ApplicantDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [withdrawalModal, setWithdrawalModal] = useState<{
    open: boolean;
    applicant?: ApplicantDetail;
  }>({ open: false });
  const [withdrawFile, setWithdrawFile] = useState<File | null>(null);
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);


  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error(error);
      toast.error('지원 현황을 불러오는 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === undefined || role === null) return;
    if (role !== 'INSPECTOR') {
      setIsLoading(false);
      return;
    }
    void loadApplications();
  }, [role, loadApplications]);

  const handleOpenWithdrawalModal = (application: ApplicantDetail) => {
    setWithdrawalModal({ open: true, applicant: application });
    setWithdrawFile(null);
  };

  const handleCloseWithdrawalModal = () => {
    setWithdrawalModal({ open: false });
    setWithdrawFile(null);
  };

  const handleSubmitWithdrawal = async () => {
    if (!withdrawalModal.applicant || !withdrawFile) {
      toast.error('접수 취소 신청서를 첨부해 주세요.');
      return;
    }

    setIsSubmittingWithdrawal(true);
    try {
      await submitApplicantWithdrawal(withdrawalModal.applicant.id, withdrawFile);
      toast.success('접수 취소 신청을 접수했습니다.');
      handleCloseWithdrawalModal();
      await loadApplications();
    } catch (error) {
      console.error(error);
      toast.error('접수 취소 신청에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  if (role !== 'INSPECTOR') {
    return (
      <div className="rounded-[20px] bg-[#FFF5F5] px-6 py-12 text-center text-red-600 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        감리자 계정으로 로그인 후 이용할 수 있습니다.
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

  // 최상위 1개만 표시
  const latestApplication = applications.length > 0 ? [applications[0]] : [];

  return (
    <div className="rounded-[20px] bg-white p-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[18px] font-bold">신청내역 조회</h1>
      </div>

      {/* Action Bar */}
      <div className="mb-4 flex items-center justify-end">
        <Button type="button" onClick={() => router.push('/applicants-apply/apply')}>
          등재 신청
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="w-full overflow-hidden">
          <table className="min-w-full border-collapse text-sm">
            <caption className="sr-only">감리자 신청 현황</caption>
            <thead className="bg-[#EDF6FF]">
              <tr className="h-12">
                <th className="px-5 text-left text-[14px] font-semibold text-[#010101]">No.</th>
                <th className="px-5 text-left text-[14px] font-semibold text-[#010101]" style={{ minWidth: '65px' }}>기수</th>
                <th className="px-5 text-left text-[14px] font-semibold text-[#010101]">접수번호</th>
                <th className="px-5 text-left text-[14px] font-semibold text-[#010101]">전문분야</th>
                <th className="px-5 text-left text-[14px] font-semibold text-[#010101]" style={{ minWidth: '80px' }}>권역</th>
                <th className="px-5 text-left text-[14px] font-semibold text-[#010101]">모집</th>
                <th className="px-5 text-left text-[14px] font-semibold text-[#010101]">진행 상태</th>
                <th className="px-5 text-left text-[14px] font-semibold text-[#010101]">신청일</th>
                <th className="px-5 text-left text-[14px] font-semibold text-[#010101]">수정일</th>
                <th className="px-5 text-left text-[14px] font-semibold text-[#010101]">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-neutral/70 text-[14px] text-heading">
                {latestApplication.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center text-secondary">
                      아직 제출한 등재 신청이 없습니다.
                    </td>
                  </tr>
                ) : (
                  latestApplication.map((application) => {
                    const statusBadge = getApplicantStatusBadge(application.status);
                    const statusLabel = getApplicantStatusLabel(application.status);
                    const appliedDate = formatDate(application.appliedAt ?? application.submittedAt);

                    return (
                      <tr
                        key={application.id}
                        className="bg-white hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/applicants-apply/${application.id}`)}
                      >
                        <td className="px-5 py-4 align-middle text-secondary">{application.id}</td>
                        <td className="px-5 py-4 align-middle text-secondary">제 {application.periodNumber}기</td>
                        <td className="px-5 py-4 align-middle text-secondary">{application.receiptNumber ?? '-'}</td>
                        <td className="px-5 py-4 align-middle text-secondary">{application.specialty ?? '-'}</td>
                        <td className="px-5 py-4 align-middle text-secondary whitespace-nowrap">{application.zone ?? '-'}</td>
                        <td className="px-5 py-4 align-middle text-secondary whitespace-nowrap">
                          {application.isRecruiting ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">
                              모집 중
                            </span>
                          ) : !application.isActive && !application.isRecruiting ? (
                            <span className="text-secondary">종료</span>
                          ) : (
                            <span className="text-secondary">모집 종료</span>
                          )}
                        </td>
                        <td className="px-5 py-4 align-middle whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge}`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-middle text-secondary">{appliedDate}</td>
                        <td className="px-5 py-4 align-middle text-secondary">
                          {(() => {
                            const updatedDate = formatDate(application.updatedAt);
                            return updatedDate === appliedDate ? '-' : updatedDate;
                          })()}
                        </td>
                        <td className="px-5 py-4 align-middle">
                          <div className="flex flex-wrap gap-2">
                            {application.status === 'PENDING' && application.isRecruiting && (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  router.push(`/applicants-apply/${application.id}/edit`);
                                }}
                              >
                                신청 수정
                              </Button>
                            )}
                            {application.status === 'RETURNED' && application.isRecruiting && (
                              <Button
                                type="button"
                                size="sm"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  router.push(`/applicants-apply/${application.id}/resubmit`);
                                }}
                              >
                                보완 제출
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleOpenWithdrawalModal(application);
                              }}
                            >
                              접수 취소
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>


      {withdrawalModal.open && withdrawalModal.applicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-xl space-y-6 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-heading">접수 취소</h3>
                <p className="mt-1 text-sm text-secondary">
                  제 {withdrawalModal.applicant.periodNumber}기 신청에 대한 접수 취소 신청서를 업로드해 주세요.
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={handleCloseWithdrawalModal}>
                닫기
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-heading">접수 취소 신청서 *</label>
                <Input
                  type="file"
                  accept=".pdf,.hwp,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const file = event.target.files?.[0] ?? null;
                    setWithdrawFile(file);
                  }}
                />
                {withdrawFile && <p className="mt-1 text-xs text-secondary">선택된 파일: {withdrawFile.name}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={handleCloseWithdrawalModal}>
                취소
              </Button>
              <Button
                type="button"
                onClick={handleSubmitWithdrawal}
                disabled={isSubmittingWithdrawal || !withdrawFile}
              >
                {isSubmittingWithdrawal ? '제출 중...' : '접수 취소 신청'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
