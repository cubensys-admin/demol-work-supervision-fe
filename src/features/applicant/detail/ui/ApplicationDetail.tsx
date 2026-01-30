'use client';

import { useRouter } from "next/navigation";
import type { ApplicantAttachment, ApplicantDetail, ApplicantGender } from "@/entities/applicant/model/types";
import {
  getApplicantStatusBadge,
  getApplicantStatusLabel,
} from "@/entities/applicant/model/status";
import { formatDate } from "@/shared/lib/date";
import { Button } from "@/shared/ui/button";
import {
  APPLICANT_ATTACHMENT_LABELS,
  APPLICANT_BUSINESS_TYPE_OPTIONS,
  APPLICANT_GENDER_OPTIONS,
  APPLICANT_GRADE_LEVEL_OPTIONS,
  APPLICANT_PROBLEM_FIELD_LABELS,
  ATTACHMENT_DISPLAY_ORDER,
  ATTACHMENT_TYPE_TO_KEY,
} from "@/features/applicant/shared/constants";

interface ApplicationDetailProps {
  application: ApplicantDetail;
}

const businessTypeLabelMap = Object.fromEntries(
  APPLICANT_BUSINESS_TYPE_OPTIONS.map(({ value, label }) => [value, label]),
);

const gradeLevelLabelMap = Object.fromEntries(
  APPLICANT_GRADE_LEVEL_OPTIONS.map(({ value, label }) => [value, label]),
);

const genderLabelMap = Object.fromEntries(
  APPLICANT_GENDER_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<ApplicantGender, string>;

function AttachmentItem({ attachment }: { attachment: ApplicantAttachment }) {
  const attachmentKey = attachment.type ? ATTACHMENT_TYPE_TO_KEY[attachment.type] : undefined;
  const label =
    attachmentKey && attachmentKey !== 'careerCertificates'
      ? APPLICANT_ATTACHMENT_LABELS[attachmentKey]?.label
      : attachment.type;

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-border-light px-4 py-3 text-sm">
      <div>
        <p className="font-medium text-heading">{label ?? attachment.type}</p>
        <p className="text-xs text-secondary">{attachment.originalFilename}</p>
      </div>
      {attachment.downloadUrl && (
        <a
          href={attachment.downloadUrl}
          className="rounded-lg border border-primary px-3 py-1 text-sm text-primary transition hover:bg-primary hover:text-white"
        >
          다운로드
        </a>
      )}
    </li>
  );
}

export function ApplicationDetail({ application }: ApplicationDetailProps) {
  const router = useRouter();

  const statusBadge = getApplicantStatusBadge(application.status);
  const statusLabel = getApplicantStatusLabel(application.status);
  const appliedAt = formatDate(application.appliedAt ?? application.submittedAt);
  const updatedAt = formatDate(application.updatedAt);

  const gradeLabels = application.appliedScales?.map((scale) => gradeLevelLabelMap[scale] ?? scale) ?? [];
  const legacyPersonnel = (application as unknown as { technicalPersonnel?: ApplicantDetail["personnel"] })
    .technicalPersonnel;
  const personnelList = application.personnel ?? legacyPersonnel ?? [];

  const canResubmit = application.status === "RETURNED";

  return (
    <div className="flex flex-col gap-8 pb-16">
      <section className="rounded-[24px] bg-gradient-to-r from-[#E3F4FF] via-[#DFEDFF] to-[#F4F7FB] px-8 py-10 text-heading shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">신청 상세 정보</h1>
            <p className="mt-2 text-sm text-secondary">
              제 {application.periodNumber}기 감리자 등재 신청 상세 내역입니다.
            </p>
            {application.receiptNumber && (
              <p className="text-xs text-secondary">접수번호 {application.receiptNumber}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${statusBadge}`}>
              {statusLabel}
            </span>
            <span className="text-sm text-secondary">신청일 {appliedAt}</span>
            {updatedAt && <span className="text-sm text-secondary">최종 수정 {updatedAt}</span>}
          </div>
        </div>
      </section>

      <section className="rounded-[20px] bg-white px-8 py-8 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <h2 className="text-xl font-semibold text-heading">기본 정보</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-secondary">권역</p>
            <p className="text-sm text-heading">{application.zone ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-secondary">신청인</p>
            <p className="text-sm text-heading">{application.applicantName ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-secondary">전문분야</p>
            <p className="text-sm text-heading">{application.specialty ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-secondary">성별</p>
            <p className="text-sm text-heading">{application.gender ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-secondary">자격번호</p>
            <p className="text-sm text-heading">{application.remark ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-secondary">세움터 ID</p>
            <p className="text-sm text-heading">{application.seumterId ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-secondary">감리자 교육이수번호</p>
            <p className="text-sm text-heading">{application.educationCompletionNumber ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-secondary">사무소 주소</p>
            <p className="text-sm text-heading">{application.officeAddress ?? "-"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[20px] bg-white px-8 py-8 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <h2 className="text-xl font-semibold text-heading">사업자 정보</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs text-secondary">사업자 유형</p>
            <p className="text-sm text-heading">
              {application.businessType
                ? businessTypeLabelMap[application.businessType] ?? application.businessType
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-secondary">사업자등록번호</p>
            <p className="text-sm text-heading">{application.registrationNumber ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-secondary">건설기술용역업 등록번호 1</p>
            <p className="text-sm text-heading">{application.engineeringServiceNumber1 ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-secondary">건설기술용역업 등록번호 2</p>
            <p className="text-sm text-heading">{application.engineeringServiceNumber2 ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-secondary">건설기술용역업 등록번호 3</p>
            <p className="text-sm text-heading">{application.engineeringServiceNumber3 ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-secondary">건설기술용역업 등록일자</p>
            <p className="text-sm text-heading">{application.engineeringServiceRegisteredAt ?? "-"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[20px] bg-white px-8 py-8 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <h2 className="text-xl font-semibold text-heading">신청 분야 및 기술인력</h2>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs text-secondary">신청 분야(규모)</p>
            <p className="text-sm text-heading">
              {gradeLabels.length > 0 ? gradeLabels.join(", ") : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-secondary">소속 기술인력</p>
            {personnelList.length === 0 ? (
              <p className="text-sm text-heading">-</p>
            ) : (
              <div className="mt-2 overflow-x-auto">
                <table className="min-w-full divide-y divide-border-light text-sm">
                  <thead className="bg-[#EDF6FF] text-xs font-medium text-secondary">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left">성명</th>
                      <th scope="col" className="px-3 py-2 text-left">생년월일</th>
                      <th scope="col" className="px-3 py-2 text-left">성별</th>
                      <th scope="col" className="px-3 py-2 text-left">해당 자격</th>
                      <th scope="col" className="px-3 py-2 text-left">경력증명서</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light bg-white">
                    {personnelList.map((person, index) => {
                      const birthDateLabel = person.birthDate
                        ? formatDate(person.birthDate)
                        : "-";
                      const genderLabel = person.gender
                        ? genderLabelMap[person.gender] ?? person.gender
                        : "-";
                      return (
                        <tr
                          key={person.identifier ?? `${person.name}-${index}`}
                          className="text-heading"
                        >
                          <td className="px-3 py-2 align-top">{person.name ?? "-"}</td>
                          <td className="px-3 py-2 align-top">{birthDateLabel}</td>
                          <td className="px-3 py-2 align-top">{genderLabel}</td>
                          <td className="px-3 py-2 align-top">{person.qualification ?? "-"}</td>
                          <td className="px-3 py-2 align-top">
                            {person.careerCertificateDownloadUrl ? (
                              <span className="text-gray-400 cursor-not-allowed">
                                다운로드
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[20px] bg-white px-8 py-8 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <h2 className="text-xl font-semibold text-heading">첨부파일</h2>
        {application.attachments && application.attachments.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {[...application.attachments]
              .sort((a, b) => {
                const keyA = a.type ? ATTACHMENT_TYPE_TO_KEY[a.type] : undefined;
                const keyB = b.type ? ATTACHMENT_TYPE_TO_KEY[b.type] : undefined;
                const indexA = keyA && keyA !== 'careerCertificates' ? ATTACHMENT_DISPLAY_ORDER.indexOf(keyA as typeof ATTACHMENT_DISPLAY_ORDER[number]) : 999;
                const indexB = keyB && keyB !== 'careerCertificates' ? ATTACHMENT_DISPLAY_ORDER.indexOf(keyB as typeof ATTACHMENT_DISPLAY_ORDER[number]) : 999;
                return indexA - indexB;
              })
              .map((attachment) => (
                <AttachmentItem key={attachment.id} attachment={attachment} />
              ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-secondary">등록된 첨부파일이 없습니다.</p>
        )}
      </section>

      {application.returnReason && (
        <section className="rounded-[20px] border border-amber-200 bg-amber-50 px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <h2 className="text-xl font-semibold text-amber-800">수정 요청 내용</h2>
          <p className="mt-3 text-sm text-amber-700 whitespace-pre-wrap">{application.returnReason}</p>
          {application.problemFields && application.problemFields.length > 0 && (
            <ul className="mt-3 list-disc pl-5 text-sm text-amber-700">
              {application.problemFields.map((field) => (
                <li key={field}>{APPLICANT_PROBLEM_FIELD_LABELS[field] ?? field}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="secondary" onClick={() => router.push('/applicants-apply/status')}>
          목록으로
        </Button>
        <div className="flex gap-3">
          {canResubmit && (
            <Button
              type="button"
              onClick={() => router.push(`/applicants-apply/${application.id}/resubmit`)}
            >
              보완 제출
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
