'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type {
  DemolitionRequestDetail as DetailType,
} from '@/entities/demolition/model/types';
import { getDemolitionStatusLabel, getInspectorDemolitionStatusLabel, getDemolitionStatusBadge, getDemolitionTypeLabel, getDemolitionTypeBadge } from '@/entities/demolition/model/status';
import { formatDate } from '@/shared/lib/date';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  assignSupervisor,
  preRecommendDemolitionRequest,
  requestVerificationDemolitionRequest,
  rejectInitialDemolitionRequest,
  completeRecommendationDemolitionRequest,
  completeVerificationDemolitionRequest,
  rejectVerificationDemolitionRequest,
  submitSettlement,
  submitCompletion,
  downloadCompletionAttachment,
} from '@/entities/demolition/api';
import { useAuthStore } from '@/shared/model/authStore';
import { APPLICANT_GRADE_LEVEL_OPTIONS } from '@/features/applicant/shared/constants';

const GRADE_LEVEL_LABEL_MAP = Object.fromEntries(
  APPLICANT_GRADE_LEVEL_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<string, string>;

interface CompletionFormState {
  supervisionFee: string;
  paymentAmount: string;
  paymentCompleted: boolean;
  paymentCompletedAt: string;
  contractAmount: string;
  associationFee: string;
  contractorName: string;
}

const INITIAL_COMPLETION_FORM: CompletionFormState = {
  supervisionFee: '',
  paymentAmount: '',
  paymentCompleted: false,
  paymentCompletedAt: '',
  contractAmount: '',
  associationFee: '',
  contractorName: '',
};

interface DemolitionRequestDetailProps {
  request: DetailType;
  onRefresh?: (updated: DetailType) => void;
}

export function DemolitionRequestDetail({ request, onRefresh }: DemolitionRequestDetailProps) {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const isInspector = role === 'INSPECTOR';

  const getListPath = () => {
    if (role === 'INSPECTOR') return '/demolition/inspector-work';
    if (role === 'DISTRICT_OFFICE') return '/district/demolition/status';
    if (role === 'CITY_HALL') return '/city/demolition/status';
    if (role === 'ARCHITECT_SOCIETY') return '/architect/demolition/status';
    return '/demolition/status';
  };
  const rejectionReasonTitle =
    request.status === 'INITIAL_REJECTED' ? '초기 반려 사유' : '검증 거절 사유';
  const rejectionReason =
    request.status === 'INITIAL_REJECTED'
      ? request.initialRejectionReason
      : request.rejectionReason;
  const completionReport = request.completionReport;
  const [completionForm, setCompletionForm] = useState<CompletionFormState>(INITIAL_COMPLETION_FORM);
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);
  const [completionAttachments, setCompletionAttachments] = useState<File[]>([]);
  const completionAttachmentInputRef = useRef<HTMLInputElement | null>(null);
  const [isEditingSettlement, setIsEditingSettlement] = useState(false);

  useEffect(() => {
    setCompletionForm(INITIAL_COMPLETION_FORM);
    setCompletionAttachments([]);
    setIsEditingSettlement(false);
    if (completionAttachmentInputRef.current) {
      completionAttachmentInputRef.current.value = '';
    }
  }, [request.id]);

  const handleStartEditSettlement = () => {
    if (completionReport) {
      setCompletionForm({
        supervisionFee: completionReport.supervisionFee?.toString() ?? '',
        paymentAmount: completionReport.paymentAmount?.toString() ?? '',
        paymentCompleted: completionReport.paymentCompleted ?? false,
        paymentCompletedAt: completionReport.paymentCompletedAt
          ? new Date(completionReport.paymentCompletedAt).toISOString().slice(0, 16)
          : '',
        contractAmount: completionReport.contractAmount?.toString() ?? '',
        associationFee: completionReport.associationFee?.toString() ?? '',
        contractorName: completionReport.contractorName ?? '',
      });
    }
    setIsEditingSettlement(true);
  };

  const handleCancelEditSettlement = () => {
    setIsEditingSettlement(false);
    setCompletionForm(INITIAL_COMPLETION_FORM);
  };

  const handleDownloadCompletionAttachment = async (attachmentId: number, filename?: string) => {
    try {
      const response = await downloadCompletionAttachment(request.id, attachmentId);

      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });

      const contentDisposition = response.headers['content-disposition'];
      let downloadFilename = filename || 'download';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i);
        if (filenameMatch?.[1]) {
          downloadFilename = decodeURIComponent(filenameMatch[1]);
        }
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('파일 다운로드에 실패했습니다.');
    }
  };


  const formatDateTime = (value?: string | null) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(parsed);
  };

  const formatCurrency = (value?: number | null) => {
    if (value == null) {
      return '-';
    }
    return value.toLocaleString('ko-KR');
  };

  const formatBoolean = (value?: boolean | null) => {
    if (value == null) {
      return '-';
    }
    return value ? '예' : '아니오';
  };

  const formatNumberValue = (value?: number | null, unit?: string) => {
    if (value == null) {
      return '-';
    }
    const formatted = value.toLocaleString('ko-KR');
    return unit ? `${formatted} ${unit}` : formatted;
  };

  const joinPermitNumber = (
    segments: Array<string | number | null | undefined>,
  ) => {
    const validSegments = segments.filter((segment) => segment !== null && segment !== undefined && `${segment}`.trim() !== '');
    if (validSegments.length === 0) {
      return '-';
    }
    return validSegments.join('-');
  };

  const getSpanClassName = (span?: number) => {
    if (span === 4) return 'md:col-span-2 xl:col-span-4';
    if (span === 3) return 'md:col-span-2 xl:col-span-3';
    if (span === 2) return 'md:col-span-2';
    return '';
  };

  const buildingPermitNumber = joinPermitNumber([
    request.demolitionPermitNumber1,
    request.demolitionPermitNumber2,
    request.demolitionPermitNumber3,
    request.demolitionPermitNumber4,
  ]);

  const demolitionScaleLabel = request.demolitionScale
    ? GRADE_LEVEL_LABEL_MAP[request.demolitionScale] ?? request.demolitionScale
    : '-';

  const buildingInfoSections = [
    {
      title: '기본 정보',
      items: [
        { label: '신청 구분', value: request.applicationCategory || '-' },
        { label: '지역지구', value: request.region || '-' },
        { label: '용도', value: request.buildingUse || '-' },
        { label: '구조 형식', value: request.structureType || '-' },
        { label: '대지위치', value: request.siteAddress || '-', span: 2 },
        { label: '상세 주소', value: request.siteDetailAddress || '-', span: 2 },
      ],
    },
    {
      title: '규모 및 면적',
      items: [
        { label: '지상층수', value: request.floorsAbove != null ? `${request.floorsAbove}층` : '-' },
        { label: '지하층수', value: request.floorsBelow != null ? `${request.floorsBelow}층` : '-' },
        { label: '대지면적', value: formatNumberValue(request.siteArea, '㎡') },
        { label: '건축면적', value: formatNumberValue(request.buildingArea, '㎡') },
        { label: '연면적', value: formatNumberValue(request.totalFloorArea, '㎡') },
        { label: '규모', value: demolitionScaleLabel },
        { label: '해체공사 유형', value: request.demolitionType || '-' },
      ],
    },
    {
      title: '해체 허가 정보',
      items: [
        { label: '허가(신고) 번호', value: buildingPermitNumber },
        { label: '허가(신고) 일자', value: request.demolitionPermitDate || '-' },
      ],
    },
  ];

  const handleAssignSupervisor = async () => {
    if (!window.confirm('감리자를 최종 지정하시겠습니까?')) return;

    try {
      await assignSupervisor(request.id);
      toast.success('감리자가 지정되었습니다.');
      router.push(getListPath());
    } catch (error) {
      console.error(error);
      toast.error('감리자 지정에 실패했습니다.');
    }
  };

  const handleEditRequest = () => {
    if (role === 'DISTRICT_OFFICE') {
      router.push(`/district/demolition/request?editId=${request.id}`);
    } else {
      router.push(`/demolition/request?editId=${request.id}`);
    }
  };

  const handlePreRecommend = async () => {
    const confirmMessage =
      request.status === 'VERIFICATION_REJECTED'
        ? '검증 거절된 건입니다. 가추천을 다시 진행하고 검증을 재요청하시겠습니까?'
        : '가추천을 진행하고 검증을 요청하시겠습니까?';

    if (!window.confirm(confirmMessage)) return;

    try {
      const updated = await preRecommendDemolitionRequest(request.id);
      toast.success('가추천을 완료하고 검증을 요청했습니다.');
      onRefresh?.(updated);
      if (!onRefresh) {
        router.push(getListPath());
      }
    } catch (error) {
      console.error(error);
      toast.error('가추천에 실패했습니다.');
    }
  };

  const handleRequestVerification = async () => {
    if (!window.confirm('건축사회 검증을 요청하시겠습니까?')) return;

    try {
      const updated = await requestVerificationDemolitionRequest(request.id);
      toast.success('검증을 요청했습니다.');
      onRefresh?.(updated);
      if (!onRefresh) {
        router.push(getListPath());
      }
    } catch (error) {
      console.error(error);
      toast.error('검증 요청에 실패했습니다.');
    }
  };

  const handleRejectInitial = async () => {
    const reason = window.prompt('초기 반려 사유를 입력해주세요.');
    const trimmed = reason?.trim();

    if (!trimmed) {
      toast.error('초기 반려 사유를 입력해야 합니다.');
      return;
    }

    if (!window.confirm('입력한 사유로 요청을 반려하시겠습니까?')) {
      return;
    }

    try {
      const updated = await rejectInitialDemolitionRequest(request.id, { reason: trimmed });
      toast.success('요청을 반려했습니다.');
      onRefresh?.(updated);
      if (!onRefresh) {
        router.push(getListPath());
      }
    } catch (error) {
      console.error(error);
      toast.error('요청 반려에 실패했습니다.');
    }
  };

  const handleCompleteRecommendation = async () => {
    if (!window.confirm('추천 완료로 상태를 변경하시겠습니까?')) return;

    try {
      const updated = await completeRecommendationDemolitionRequest(request.id);
      toast.success('추천 완료 상태로 변경했습니다.');
      onRefresh?.(updated);
      if (!onRefresh) {
        router.push(getListPath());
      }
    } catch (error) {
      console.error(error);
      toast.error('추천 완료 처리에 실패했습니다.');
    }
  };

  const handleCompleteVerification = async () => {
    if (!window.confirm('검증 요청 건을 검증 완료로 처리하시겠습니까?')) return;

    try {
      const updated = await completeVerificationDemolitionRequest(request.id);
      toast.success('검증을 완료 처리했습니다.');
      onRefresh?.(updated);
      if (!onRefresh) {
        router.push(getListPath());
      }
    } catch (error) {
      console.error(error);
      toast.error('검증 완료 처리에 실패했습니다.');
    }
  };

  const handleRejectVerification = async () => {
    const reason = window.prompt('검증 거절 사유를 입력해주세요.');
    const trimmed = reason?.trim();

    if (!trimmed) {
      toast.error('검증 거절 사유를 입력해야 합니다.');
      return;
    }

    if (!window.confirm('입력한 사유로 검증을 거절하시겠습니까?')) {
      return;
    }

    try {
      const updated = await rejectVerificationDemolitionRequest(request.id, {
        rejectionReason: trimmed,
      });
      toast.success('검증 거절 처리했습니다.');
      onRefresh?.(updated);
      if (!onRefresh) {
        router.push(getListPath());
      }
    } catch (error) {
      console.error(error);
      toast.error('검증 거절 처리에 실패했습니다.');
    }
  };

  const handleSubmitSettlement = async () => {
    const hasPositiveNumber = (value: string) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0;
    };

    if (!hasPositiveNumber(completionForm.supervisionFee)) {
      toast.error('감리 수수료를 입력해주세요.');
      return;
    }
    if (!hasPositiveNumber(completionForm.paymentAmount)) {
      toast.error('입금 금액을 입력해주세요.');
      return;
    }
    if (!hasPositiveNumber(completionForm.contractAmount)) {
      toast.error('계약 금액을 입력해주세요.');
      return;
    }
    if (!hasPositiveNumber(completionForm.associationFee)) {
      toast.error('건축사회 수수료를 입력해주세요.');
      return;
    }
    if (completionForm.contractorName.trim().length === 0) {
      toast.error('감리 계약자명을 입력해주세요.');
      return;
    }

    if (!window.confirm('실적회비 정보를 저장하시겠습니까?')) return;

    try {
      const payload = {
        supervisionFee: Number(completionForm.supervisionFee),
        paymentAmount: Number(completionForm.paymentAmount),
        paymentCompleted: completionForm.paymentCompleted,
        paymentCompletedAt:
          completionForm.paymentCompleted && completionForm.paymentCompletedAt
            ? new Date(completionForm.paymentCompletedAt).toISOString()
            : undefined,
        contractAmount: Number(completionForm.contractAmount),
        associationFee: Number(completionForm.associationFee),
        contractorName: completionForm.contractorName.trim(),
      };

      const updated = await submitSettlement(request.id, payload);
      toast.success('실적회비 정보를 저장했습니다.');
      setIsEditingSettlement(false);
      setCompletionForm(INITIAL_COMPLETION_FORM);
      onRefresh?.(updated);
    } catch (error) {
      console.error(error);
      toast.error('실적회비 정보 저장에 실패했습니다.');
    }
  };

  const handleSubmitCompletion = async () => {
    if (!completionReport) {
      toast.error('실적회비를 먼저 납부해주세요.');
      return;
    }

    if (completionAttachments.length === 0) {
      toast.error('첨부파일을 최소 1개 이상 업로드해주세요.');
      return;
    }

    if (!window.confirm('감리 완료 보고를 제출하시겠습니까?')) return;

    setIsSubmittingCompletion(true);
    try {
      const updated = await submitCompletion(
        request.id,
        completionAttachments,
      );
      toast.success('감리 완료 보고를 제출했습니다.');
      setCompletionForm(INITIAL_COMPLETION_FORM);
      setCompletionAttachments([]);
      onRefresh?.(updated);
      if (!onRefresh) {
        router.push(getListPath());
      }
    } catch (error) {
      console.error(error);
      toast.error('감리 완료 보고 제출에 실패했습니다.');
    } finally {
      setIsSubmittingCompletion(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-secondary">해체감리 요청 상세</p>
            <div>
              <h1 className="text-2xl font-semibold text-heading">{request.requestNumber}</h1>
              <p className="mt-1 text-sm text-secondary">
                요청일자: {formatDate(request.requestDate)}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(getListPath())}
          >
            목록으로
          </Button>
        </div>
      </div>

      {/* Status Info */}
      <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <h2 className="text-xl font-semibold mb-4">진행 상태</h2>
        <div className="flex items-center gap-4 mb-4">
          <span className={`rounded-full px-4 py-2 text-sm font-semibold ${getDemolitionTypeBadge(request.requestType)}`}>
            {getDemolitionTypeLabel(request.requestType)}
          </span>
          <span className={`rounded-full px-4 py-2 text-sm font-semibold ${getDemolitionStatusBadge(request.status)}`}>
            {isInspector ? getInspectorDemolitionStatusLabel(request.status) : getDemolitionStatusLabel(request.status)}
          </span>
        </div>
        {request.cancellationReason && (
          <p className="text-sm text-secondary whitespace-pre-wrap">
            취소 사유: {request.cancellationReason}
          </p>
        )}

        {rejectionReason && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div className="font-semibold text-red-800 mb-2">{rejectionReasonTitle}</div>
            <p className="text-red-700">{rejectionReason}</p>
          </div>
        )}
      </div>

      {(isInspector || role === 'ARCHITECT_SOCIETY') && (request.status === 'SUPERVISOR_ASSIGNED' || request.status === 'SUPERVISOR_COMPLETED') && (
        <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <h2 className="text-xl font-semibold mb-4">실적회비</h2>

          {!completionReport && (
            <div className="py-8 text-center">
              {role === 'ARCHITECT_SOCIETY' && (
                <p className="text-lg font-semibold text-amber-600">미납</p>
              )}
              {isInspector && (
                <p className="mt-2 text-sm text-secondary">
                  실적회비 납부 후 감리 완료보고서를 제출 하실 수 있습니다.
                </p>
              )}
            </div>
          )}

          {isInspector && completionReport && !completionReport.settled && (
            <p className="text-sm text-secondary mb-6">
              실적회비 납부 후 감리 완료보고서를 제출 하실 수 있습니다.
            </p>
          )}

          {isInspector && (!completionReport?.settled || isEditingSettlement) && request.status === 'SUPERVISOR_ASSIGNED' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                  감리 수수료 (원)
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={completionForm.supervisionFee}
                    onChange={(event) =>
                      setCompletionForm((prev) => ({
                        ...prev,
                        supervisionFee: event.target.value,
                      }))
                    }
                    placeholder="예: 1200000"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                  입금 금액 (원)
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={completionForm.paymentAmount}
                    onChange={(event) =>
                      setCompletionForm((prev) => ({
                        ...prev,
                        paymentAmount: event.target.value,
                      }))
                    }
                    placeholder="예: 800000"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                  계약 금액 (원)
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={completionForm.contractAmount}
                    onChange={(event) =>
                      setCompletionForm((prev) => ({
                        ...prev,
                        contractAmount: event.target.value,
                      }))
                    }
                    placeholder="예: 1500000"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                  건축사회 수수료 (원)
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={completionForm.associationFee}
                    onChange={(event) =>
                      setCompletionForm((prev) => ({
                        ...prev,
                        associationFee: event.target.value,
                      }))
                    }
                    placeholder="예: 50000"
                    required
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                  감리 계약자명
                  <Input
                    type="text"
                    maxLength={100}
                    value={completionForm.contractorName}
                    onChange={(event) =>
                      setCompletionForm((prev) => ({
                        ...prev,
                        contractorName: event.target.value,
                      }))
                    }
                    placeholder="감리 계약자명을 입력하세요"
                    required
                  />
                </label>

                <div className="flex flex-col gap-2 text-sm font-medium text-heading">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={completionForm.paymentCompleted}
                      onChange={(event) =>
                        setCompletionForm((prev) => ({
                          ...prev,
                          paymentCompleted: event.target.checked,
                          paymentCompletedAt: event.target.checked
                            ? prev.paymentCompletedAt
                            : '',
                        }))
                      }
                    />
                    입금 완료 여부
                  </label>
                  {completionForm.paymentCompleted && (
                    <Input
                      type="datetime-local"
                      value={completionForm.paymentCompletedAt}
                      onChange={(event) =>
                        setCompletionForm((prev) => ({
                          ...prev,
                          paymentCompletedAt: event.target.value,
                        }))
                      }
                      required
                    />
                  )}
                </div>
              </div>

            <div className="flex justify-end gap-3">
              {isEditingSettlement && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelEditSettlement}
                >
                  취소
                </Button>
              )}
              <Button
                type="button"
                onClick={handleSubmitSettlement}
              >
                {isEditingSettlement ? '실적회비 수정' : '실적회비 납부'}
              </Button>
            </div>
            </div>
          )}

          {completionReport?.settled && !isEditingSettlement && (
            <div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-secondary">감리 수수료 (원)</label>
                  <p className="mt-1 text-heading">{formatCurrency(completionReport.supervisionFee)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary">입금 금액 (원)</label>
                  <p className="mt-1 text-heading">{formatCurrency(completionReport.paymentAmount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary">계약 금액 (원)</label>
                  <p className="mt-1 text-heading">{formatCurrency(completionReport.contractAmount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary">건축사회 수수료 (원)</label>
                  <p className="mt-1 text-heading">{formatCurrency(completionReport.associationFee)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary">감리 계약자명</label>
                  <p className="mt-1 text-heading">{completionReport.contractorName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary">입금 완료 여부</label>
                  <p className="mt-1 text-heading">{formatBoolean(completionReport.paymentCompleted)}</p>
                </div>
                {completionReport.paymentCompletedAt && (
                  <div>
                    <label className="text-sm font-medium text-secondary">입금 완료 일시</label>
                    <p className="mt-1 text-heading">{formatDateTime(completionReport.paymentCompletedAt)}</p>
                  </div>
                )}
              </div>
              {isInspector && request.status === 'SUPERVISOR_ASSIGNED' && (
                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleStartEditSettlement}
                  >
                    수정
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isInspector && request.status === 'SUPERVISOR_ASSIGNED' && (
        <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <h2 className="text-xl font-semibold mb-4">감리 완료 보고</h2>

          <div className="flex flex-col gap-2 text-sm font-medium text-heading">
            <label className="text-sm font-medium text-heading">첨부파일 (최소 1개)</label>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => completionAttachmentInputRef.current?.click()}
              >
                파일 선택
              </Button>
              <input
                ref={completionAttachmentInputRef}
                type="file"
                multiple
                accept=".pdf,.hwp,.doc,.docx,.jpg,.jpeg,.png"
                hidden
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  if (files.length > 0) {
                    setCompletionAttachments((prev) => [...prev, ...files]);
                    event.target.value = '';
                  }
                }}
              />
              <span className="text-xs text-secondary">
                파일 형식 및 용량 제한은 브라우저 업로드 정책을 따릅니다.
              </span>
            </div>
            {completionAttachments.length > 0 ? (
              <ul className="mt-4 space-y-2 text-sm text-secondary">
                {completionAttachments.map((file, index) => (
                  <li key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between gap-2 rounded-lg border border-border-light bg-gray-50 px-4 py-3">
                    <span className="break-all">{file.name}</span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setCompletionAttachments((prev) =>
                          prev.filter((_, fileIndex) => fileIndex !== index),
                        )
                      }
                    >
                      제거
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-secondary">첨부할 파일을 선택해주세요.</p>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              onClick={handleSubmitCompletion}
              disabled={!completionReport || completionAttachments.length === 0 || isSubmittingCompletion}
            >
              {isSubmittingCompletion ? '제출 중...' : '감리 완료 제출'}
            </Button>
          </div>
        </div>
      )}

      {completionReport && (
        <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <h2 className="text-xl font-semibold mb-4">제출된 감리 완료 보고</h2>

          {completionReport.attachments && completionReport.attachments.length > 0 && (
            <div>
              <label className="text-sm font-medium text-secondary">첨부파일</label>
              <ul className="mt-2 space-y-2 text-sm">
                {completionReport.attachments.map((attachment) => (
                  <li key={attachment.id ?? attachment.downloadUrl} className="flex items-center justify-between gap-4">
                    <span className="font-medium text-heading">
                      {attachment.fileLabel || '첨부파일'}
                    </span>
                    <div className="flex items-center gap-3">
                      {attachment.originalName && (
                        <span className="text-xs text-gray-500">{attachment.originalName}</span>
                      )}
                      {attachment.id ? (
                        <button
                          type="button"
                          onClick={() => handleDownloadCompletionAttachment(attachment.id!, attachment.originalName)}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          다운로드
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-secondary">보고 생성</label>
              <p className="mt-1 text-heading">{formatDateTime(completionReport.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary">보고 수정</label>
              <p className="mt-1 text-heading">{formatDateTime(completionReport.updatedAt)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Applicant Info (구청 담당자 정보) */}
      <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <h2 className="text-xl font-semibold mb-4">신청자 정보</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-secondary">구청</label>
            <p className="mt-1 text-heading">{request.districtOffice}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-secondary">담당자명</label>
            <p className="mt-1 text-heading">{request.officerName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-secondary">담당자 연락처</label>
            <p className="mt-1 text-heading">{request.officerPhone || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-secondary">담당자 이메일</label>
            <p className="mt-1 text-heading">{request.officerEmail || '-'}</p>
          </div>
        </div>
      </div>

      {/* Owner Info */}
      <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <h2 className="text-xl font-semibold mb-4">건축주 정보</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-secondary">건축주명</label>
            <p className="mt-1 text-heading">{request.ownerName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-secondary">건축주 연락처</label>
            <p className="mt-1 text-heading">{request.ownerPhone || '-'}</p>
          </div>
          <div className="md:col-span-2 col-span-1">
            <label className="text-sm font-medium text-secondary">건축주 주소</label>
            <p className="mt-1 text-heading">{request.ownerAddress || '-'}</p>
          </div>
        </div>
      </div>

      {/* Building Info */}
      <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <h2 className="text-xl font-semibold mb-6">건축물 정보</h2>

        <div className="space-y-6">
          {buildingInfoSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="text-sm font-semibold text-secondary">{section.title}</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-lg border border-border-neutral/60 bg-gray-50 px-4 py-3 ${getSpanClassName(
                      item.span,
                    )}`}
                  >
                    <p className="text-xs font-medium text-secondary">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-heading break-words">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supervisor Info */}
      {!isInspector && (request.supervisorId != null ||
        request.supervisorName ||
        request.supervisorUsername ||
        request.supervisorEmail ||
        (request.assignmentHistories && request.assignmentHistories.length > 0)) && (
        <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <h2 className="text-xl font-semibold mb-4">감리자 정보 (연동 예정)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-secondary">감리자 ID</label>
              <p className="mt-1 text-heading">{request.supervisorId ?? '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary">감리자명</label>
              <p className="mt-1 text-heading">{request.supervisorName || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary">계정 (아이디)</label>
              <p className="mt-1 text-heading">{request.supervisorUsername || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary">이메일</label>
              <p className="mt-1 text-heading">{request.supervisorEmail || '-'}</p>
            </div>
          </div>

          {(role === 'CITY_HALL' || role === 'ARCHITECT_SOCIETY') && (request.assignmentHistories && request.assignmentHistories.length > 0) && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-heading">배정 이력</h3>
              <ul className="mt-3 space-y-2">
                {request.assignmentHistories.map((history, index) => (
                  <li
                    key={`${history.eventType}-${history.createdAt}-${index}`}
                    className="rounded border border-border-light px-4 py-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium text-heading">
                        {history.eventType === 'SELECTED' && '감리자 지정'}
                        {history.eventType === 'RELEASED' && '감리자 해제'}
                        {history.eventType === 'CONFIRMED' && '감리자 확정'}
                        {history.eventType === 'COMPLETED' && '감리 업무 완료'}
                      </div>
                      <div className="text-xs text-secondary">
                        {formatDateTime(history.createdAt)}
                      </div>
                    </div>
                    {(history.supervisorName || history.reason) && (
                      <div className="mt-1 text-sm text-secondary">
                        {history.supervisorName && <span>감리자: {history.supervisorName}</span>}
                        {history.reason && (
                          <span className="block whitespace-pre-wrap text-secondary">
                            사유: {history.reason}
                          </span>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Priority Info */}
      {!isInspector && (request.requestType === 'PRIORITY_DESIGNATION' ||
        request.priorityDesignation ||
        request.prioritySupervisorName ||
        request.priorityReason) && (
        <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <h2 className="text-xl font-semibold mb-4">우선지정 정보</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary">우선지정 여부</label>
                <p className="mt-1 text-heading">{request.priorityDesignation ? '예' : '아니오'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary">우선지정 감리자명</label>
                <p className="mt-1 text-heading">{request.prioritySupervisorName || '-'}</p>
              </div>
            </div>

            {request.priorityReason && (
              <div>
                <label className="text-sm font-medium text-secondary">우선지정 사유</label>
                <p className="mt-1 text-heading whitespace-pre-wrap">{request.priorityReason}</p>
              </div>
            )}

            {(request.supervisorId || request.supervisorName || request.supervisorEmail || request.supervisorUsername) && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-secondary">지정 감리자 ID</label>
                  <p className="mt-1 text-heading">{request.supervisorId ?? '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary">지정 감리자명</label>
                  <p className="mt-1 text-heading">{request.supervisorName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary">지정 감리자 이메일</label>
                  <p className="mt-1 text-heading">{request.supervisorEmail || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-secondary">지정 감리자 계정</label>
                  <p className="mt-1 text-heading">{request.supervisorUsername || '-'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap justify-end gap-3">
        {role === 'DISTRICT_OFFICE' && (
          <>
            {(request.status === 'INITIAL_REQUEST' || request.status === 'INITIAL_REJECTED') && (
              <Button type="button" onClick={handleEditRequest}>
                요청 수정
              </Button>
            )}
            {request.status === 'RECOMMENDATION_COMPLETED' && (
              <Button type="button" onClick={handleAssignSupervisor}>
                감리자 최종 지정
              </Button>
            )}
          </>
        )}

        {role === 'CITY_HALL' && (
          <>
            {request.requestType === 'RECOMMENDATION' &&
              (request.status === 'INITIAL_REQUEST' || request.status === 'VERIFICATION_REJECTED' || request.status === 'RE_REQUEST') && (
                <Button type="button" onClick={handlePreRecommend}>
                  {request.status === 'VERIFICATION_REJECTED' ? '가추천 다시 진행' : '가추천'}
                </Button>
              )}
            {(request.status === 'INITIAL_REQUEST' || request.status === 'RE_REQUEST') && (
              <Button
                type="button"
                variant="secondary"
                className="border-red-300 text-red-600 hover:border-red-500 hover:text-red-700"
                onClick={handleRejectInitial}
              >
                초기 반려
              </Button>
            )}
            {request.status === 'INITIAL_REQUEST' && request.requestType === 'PRIORITY_DESIGNATION' && (
              <Button type="button" onClick={handleRequestVerification}>
                검증 요청
              </Button>
            )}
            {request.status === 'VERIFICATION_COMPLETED' && (
              <Button type="button" onClick={handleCompleteRecommendation}>
                추천 완료 처리
              </Button>
            )}
          </>
        )}

        {role === 'ARCHITECT_SOCIETY' && request.status === 'VERIFICATION_REQUESTED' && (
          <>
            <Button type="button" onClick={handleCompleteVerification}>
              검증 완료 처리
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="border-red-300 text-red-600 hover:border-red-500 hover:text-red-700"
              onClick={handleRejectVerification}
            >
              검증 거절
            </Button>
          </>
        )}

      </div>
    </div>
  );
}
