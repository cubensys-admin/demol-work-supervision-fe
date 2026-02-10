'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

import {
  getApplicantStatusBadge,
  getApplicantStatusLabel,
} from '@/entities/applicant/model/status';
import type { ApplicantDetail } from '@/entities/applicant/model/types';
import {
  APPLICANT_BUSINESS_TYPE_OPTIONS,
  APPLICANT_PROBLEM_FIELD_LABELS,
  APPLICANT_GENDER_OPTIONS,
  APPLICANT_GRADE_LEVEL_OPTIONS,
  ATTACHMENT_TYPE_TO_KEY,
  ATTACHMENT_DISPLAY_ORDER,
} from '@/features/applicant/shared/constants';
import { formatDate } from '@/shared/lib/date';
import { Button } from '@/shared/ui/button';
import { httpClient } from '@/shared/api/httpClient';

interface InspectorApplicantDetailProps {
  application: ApplicantDetail;
}

const BUSINESS_TYPE_LABEL_MAP = Object.fromEntries(
  APPLICANT_BUSINESS_TYPE_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<string, string>;

const GENDER_LABEL_MAP = Object.fromEntries(
  APPLICANT_GENDER_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<string, string>;

const SCALE_LABEL_MAP = Object.fromEntries(
  APPLICANT_GRADE_LEVEL_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<string, string>;

const ATTACHMENT_TYPE_LABELS: Record<string, string> = {
  APPLICATION_FORM: '해체공사감리업무 등재신청서',
  CONSENT_FORM: '해체공사감리업무 수행 동의서',
  SERVICE_REGISTRATION_CERTIFICATE: '개설신고확인증(건설기술용역업 등록증)',
  BUSINESS_REGISTRATION_CERTIFICATE: '사업자등록증',
  ADMINISTRATIVE_SANCTION_CHECK: '행정처분 조회서',
  SUPERVISOR_EDUCATION_CERTIFICATE: '감리자 교육 이수증',
  TECHNICIAN_EDUCATION_CERTIFICATE: '감리원 또는 기술인력 교육 이수증',
};

export function InspectorApplicantDetail({ application }: InspectorApplicantDetailProps) {
  const router = useRouter();

  const handleDownload = useCallback(async (attachmentId: number, filename?: string) => {
    try {
      const response = await httpClient.get(
        `/api/applicants/${application.id}/attachments/${attachmentId}`,
        { responseType: 'blob' }
      );

      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });

      // Content-Disposition 헤더에서 파일명 추출 시도
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
  }, [application.id]);

  const handleZoneChangeDownload = useCallback(async (attachmentId: number, filename?: string) => {
    try {
      const response = await httpClient.get(
        `/api/applicants/${application.id}/zone-change/attachments/${attachmentId}`,
        { responseType: 'blob' }
      );

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
  }, [application.id]);

  const statusBadge = getApplicantStatusBadge(application.status);
  const statusLabel = getApplicantStatusLabel(application.status);
  const canEditApplication = application.status === 'PENDING' && application.isRecruiting;

  const businessTypeLabel = application.businessType
    ? BUSINESS_TYPE_LABEL_MAP[application.businessType] ?? application.businessType
    : undefined;

  const genderLabel = application.gender
    ? GENDER_LABEL_MAP[application.gender] ?? application.gender
    : undefined;

  const appliedScalesLabel = useMemo(() => {
    if (!application.appliedScales || application.appliedScales.length === 0) {
      return '-';
    }
    return application.appliedScales
      .map((scale) => SCALE_LABEL_MAP[scale] ?? scale)
      .join(', ');
  }, [application.appliedScales]);

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div className="rounded-[24px] bg-white px-8 py-10 shadow-[2px_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-secondary">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-primary">
              제 {application.periodNumber}기
            </span>
            {application.receiptNumber && <span>접수번호 {application.receiptNumber}</span>}
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${statusBadge}`}
            >
              {statusLabel}
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-heading">감리자 등재 신청 상세</h1>
          <p className="mt-1 text-sm text-secondary">
            신청일 {formatDate(application.appliedAt ?? application.submittedAt ?? application.updatedAt)}
          </p>
        </div>
        <div className="flex gap-3">
          {canEditApplication && (
            <Button
              type="button"
              onClick={() => router.push(`/applicants-apply/${application.id}/edit`)}
            >
              신청 수정
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={() => router.push('/applicants-apply/status')}>
            목록으로
          </Button>
        </div>
      </div>

      <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <h2 className="text-xl font-semibold text-heading">기본 정보</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <DetailRow label="신청인" value={application.applicantName} />
          <DetailRow label="전문분야" value={application.specialty} />
          <DetailRow label="성별" value={genderLabel} />
          <DetailRow label="자격번호" value={application.remark} />
          <DetailRow label="세움터 ID" value={application.seumterId} />
          <DetailRow label="교육 이수번호" value={application.educationCompletionNumber} />
          {application.educationCompletionNumber && (
            <DetailRow label="교육이수증 만료기한" value={application.educationExpirationDate} />
          )}
          <DetailRow label="사업자 유형" value={businessTypeLabel} />
          <DetailRow label="사업자등록번호" value={application.registrationNumber} />
          {application.businessType === 'CORPORATION' && (
            <DetailRow label="법인등록번호" value={application.corporateRegistrationNumber} />
          )}
          <DetailRow label="사무소 주소" value={application.officeAddress} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <DetailRow
            label="개설신고번호(건설기술용역업 등록번호)"
            value={[application.engineeringServiceNumber1, application.engineeringServiceNumber2, application.engineeringServiceNumber3]
              .filter(Boolean)
              .join(' / ')}
          />
          <DetailRow label="등록일" value={application.engineeringServiceRegisteredAt} />
          <DetailRow label="권역" value={application.zone} />
        </div>

        <div className="mt-6">
          <DetailRow label="신청 규모" value={appliedScalesLabel} />
        </div>
      </div>

      <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <h2 className="text-xl font-semibold text-heading">소속 기술인력</h2>
        {application.personnel && application.personnel.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-[#EDF6FF]">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">성명</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">생년월일</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">성별</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">자격</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">경력증명서</th>
                </tr>
              </thead>
              <tbody>
                {application.personnel.map((person) => (
                  <tr key={person.identifier ?? `${person.name}-${person.birthDate}`} className="border-b">
                    <td className="px-4 py-3 text-sm text-secondary">{person.name}</td>
                    <td className="px-4 py-3 text-sm text-secondary">{person.birthDate}</td>
                    <td className="px-4 py-3 text-sm text-secondary">
                      {person.gender ? GENDER_LABEL_MAP[person.gender] ?? person.gender : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary">{person.qualification}</td>
                    <td className="px-4 py-3 text-sm text-secondary">
                      {person.careerCertificateAttachmentId ? (
                        <button
                          type="button"
                          onClick={() => handleDownload(person.careerCertificateAttachmentId!, person.careerCertificateOriginalFilename || `${person.name}_경력증명서`)}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          다운로드
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-secondary">등록된 기술인력 정보가 없습니다.</p>
        )}
      </div>

      <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <h2 className="text-xl font-semibold text-heading">첨부파일</h2>
        {application.attachments && application.attachments.length > 0 ? (
          <ul className="mt-4 space-y-3 text-sm text-secondary">
            {[...application.attachments]
              .filter((a) => a.type !== 'CAREER_CERTIFICATE')
              .sort((a, b) => {
                const keyA = a.type ? ATTACHMENT_TYPE_TO_KEY[a.type] : undefined;
                const keyB = b.type ? ATTACHMENT_TYPE_TO_KEY[b.type] : undefined;
                const indexA = keyA ? ATTACHMENT_DISPLAY_ORDER.indexOf(keyA as typeof ATTACHMENT_DISPLAY_ORDER[number]) : 999;
                const indexB = keyB ? ATTACHMENT_DISPLAY_ORDER.indexOf(keyB as typeof ATTACHMENT_DISPLAY_ORDER[number]) : 999;
                return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
              })
              .map((attachment) => {
                const label = ATTACHMENT_TYPE_LABELS[attachment.type] ?? attachment.type;
                return (
                  <li key={attachment.id} className="flex items-center justify-between gap-4">
                    <span className="font-medium text-heading">{label}</span>
                    <div className="flex items-center gap-3">
                      {attachment.originalFilename && (
                        <span className="text-xs text-gray-500">{attachment.originalFilename}</span>
                      )}
                      {attachment.id ? (
                        <button
                          type="button"
                          onClick={() => handleDownload(attachment.id, attachment.originalFilename)}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          다운로드
                        </button>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </li>
                );
              })}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-secondary">첨부파일이 없습니다.</p>
        )}
      </div>

      {application.returnReason && (
        <div className="rounded-[20px] border-2 border-red-400 bg-red-50 px-8 py-6 shadow-[2px_4px_20px_rgba(239,68,68,0.15)]">
          <h2 className="flex items-center gap-2 text-xl font-bold text-red-600">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white text-sm">!</span>
            수정 요청
          </h2>
          <div className="mt-4 rounded-lg border border-red-300 bg-white px-5 py-4 text-base text-red-800">
            <p className="whitespace-pre-wrap font-medium">{application.returnReason}</p>
            {application.problemFields && application.problemFields.length > 0 && (
              <ul className="mt-3 list-disc pl-5 text-red-700">
                {application.problemFields.map((field) => (
                  <li key={field} className="mt-1">{APPLICANT_PROBLEM_FIELD_LABELS[field] ?? field}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {application.zoneChangeRequest && (
        <div className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <h2 className="text-xl font-semibold text-heading">권역 변경 신청</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DetailRow label="신청 권역" value={application.zoneChangeRequest.zone} />
            <DetailRow label="신청일" value={formatDate(application.zoneChangeRequest.createdAt)} />
          </div>
          <div className="mt-4">
            <DetailRow label="변경 사유" value={application.zoneChangeRequest.description} />
          </div>
          {application.zoneChangeRequest.attachments &&
            application.zoneChangeRequest.attachments.length > 0 && (
              <div className="mt-4">
                <label className="text-sm font-medium text-heading">첨부파일</label>
                <ul className="mt-2 space-y-2 text-sm">
                  {application.zoneChangeRequest.attachments.map((attachment) => (
                    <li key={attachment.id} className="flex items-center justify-between gap-4">
                      <span className="font-medium text-heading">권역 변경 첨부파일</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{attachment.originalFilename}</span>
                        <button
                          type="button"
                          onClick={() => handleZoneChangeDownload(attachment.id, attachment.originalFilename)}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          다운로드
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value?: string | number | null;
  className?: string;
}

function DetailRow({ label, value, className }: DetailRowProps) {
  return (
    <div className={className}>
      <span className="text-sm font-medium text-secondary">{label}</span>
      <p className="mt-1 text-sm text-heading">
        {value !== undefined && value !== null && value !== '' ? value : '-'}
      </p>
    </div>
  );
}
