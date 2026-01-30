'use client';

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Image from 'next/image';
import { toast } from "sonner";

import {
  getApplicantsByPeriod,
  getApplicantById,
  startApplicantReview,
  approveApplicant,
  rejectApplicant,
  returnApplicant,
} from "@/entities/applicant/api";
import type {
  ApplicantDetail,
  ApplicantProblemField,
  ApplicantAttachmentType,
  ApplicantSubmissionAttachment,
  ApplicantSubmissionSnapshot,
  ApplicantSummary,
  ApplicantPersonnel,
  ApplicantStatus,
} from "@/entities/applicant/model/types";
import {
  getApplicantStatusBadge,
  getApplicantStatusLabel,
} from "@/entities/applicant/model/status";
import { getRecruitments } from "@/entities/recruitment/api/getRecruitments";
import type { Recruitment } from "@/entities/recruitment/model/types";
import {
  APPLICANT_BUSINESS_TYPE_OPTIONS,
  APPLICANT_GENDER_OPTIONS,
  APPLICANT_GRADE_LEVEL_OPTIONS,
  APPLICANT_PROBLEM_FIELD_LABELS,
  APPLICANT_ATTACHMENT_LABELS,
  ATTACHMENT_KEY_TO_TYPE,
  ATTACHMENT_DISPLAY_ORDER,
} from "@/features/applicant/shared/constants";
import { formatDate } from "@/shared/lib/date";
import { Button } from "@/shared/ui/button";
import { TextField } from "@/shared/ui/text-field";
import { classNames } from "@/shared/lib/classNames";
import { useAuthStore } from "@/shared/model/authStore";
import { Select } from "@/shared/ui/select";
import { Pagination } from "@/shared/ui/pagination";

const businessTypeLabelMap = Object.fromEntries(
  APPLICANT_BUSINESS_TYPE_OPTIONS.map(({ value, label }) => [value, label]),
);

const gradeLevelLabelMap = Object.fromEntries(
  APPLICANT_GRADE_LEVEL_OPTIONS.map(({ value, label }) => [value, label]),
);

const genderLabelMap = Object.fromEntries(
  APPLICANT_GENDER_OPTIONS.map(({ value, label }) => [value, label]),
);

const MANAGEMENT_STATUS_LABEL_MAP: Partial<Record<ApplicantStatus, string>> = {
  REJECTED: "승인불가",
  RETURNED: "보안요청",
  RESUBMITTED: "보안 검토중",
};

const ZONES = ['서북권', '동북권', '동남권', '서남권'] as const;

type AppliedFilters = {
  status?: string;
  zone?: string;
  name?: string;
  from?: string;
  to?: string;
};

function getManagementStatusLabel(status: ApplicantStatus) {
  return MANAGEMENT_STATUS_LABEL_MAP[status] ?? getApplicantStatusLabel(status);
}

function formatPersonnelItem(person: ApplicantPersonnel) {
  const genderLabel = person.gender ? genderLabelMap[person.gender] ?? person.gender : "-";
  const birthDateLabel = person.birthDate ? formatDate(person.birthDate) : "-";
  const parts = [
    `성명: ${person.name ?? "-"}`,
    `생년월일: ${birthDateLabel}`,
    `성별: ${genderLabel}`,
    `자격: ${person.qualification ?? "-"}`,
  ];

  if (person.careerCertificateDownloadUrl) {
    parts.push("경력증명서: 첨부됨");
  } else {
    parts.push("경력증명서: 없음");
  }

  return parts.join("\n");
}

function normalizeProblemField(field: string): ApplicantProblemField {
  if (field === "technicalPersonnel") return "personnel";
  if (field === "careerCertificate") return "careerCertificates";
  if (field === "zoneCode") return "zone";
  return field as ApplicantProblemField;
}

function createProblemFieldSet(fields?: (ApplicantProblemField | string)[]) {
  if (!fields) {
    return new Set<ApplicantProblemField>();
  }
  const normalized = fields.map((field) => normalizeProblemField(field));
  return new Set<ApplicantProblemField>(normalized);
}

const SNAPSHOT_FIELD_MAP: Partial<
  Record<ApplicantProblemField, keyof ApplicantSubmissionSnapshot>
> = {
  remark: "remark",
  specialty: "specialty",
  applicantName: "applicantName",
  gender: "gender",
  seumterId: "seumterId",
  educationCompletionNumber: "educationCompletionNumber",
  officeAddress: "officeAddress",
  businessType: "businessType",
  registrationNumber: "registrationNumber",
  engineeringServiceNumber1: "engineeringServiceNumber1",
  engineeringServiceNumber2: "engineeringServiceNumber2",
  engineeringServiceNumber3: "engineeringServiceNumber3",
  engineeringServiceRegisteredAt: "engineeringServiceRegisteredAt",
  appliedScales: "appliedScales",
  personnel: "personnel",
  applicationForm: "attachments",
  consentForm: "attachments",
  serviceRegistrationCertificate: "attachments",
  careerCertificates: "attachments",
  businessRegistrationCertificate: "attachments",
  administrativeSanctionCheck: "attachments",
  supervisorEducationCertificate: "attachments",
  technicianEducationCertificate: "attachments",
};

interface DetailModalState {
  applicant: ApplicantSummary;
  detail?: ApplicantDetail;
  isLoading: boolean;
  showReturn: boolean;
  returnReason: string;
  selectedFields: Set<ApplicantProblemField>;
}

export function ApplicantManagement() {
  const role = useAuthStore((state) => state.role);
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [applicants, setApplicants] = useState<ApplicantSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [detailModal, setDetailModal] = useState<DetailModalState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<'ALL' | ApplicantStatus>('ALL');
  const [zoneFilter, setZoneFilter] = useState<'ALL' | typeof ZONES[number]>('ALL');
  const [nameFilter, setNameFilter] = useState('');
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  const isArchitectSociety = role === 'ARCHITECT_SOCIETY';

  const loadRecruitments = useCallback(async () => {
    try {
      const response = await getRecruitments({ page: 0, size: 50 });
      const content = response.content ?? [];
      const sorted = [...content].sort(
        (a, b) => (b.periodNumber ?? 0) - (a.periodNumber ?? 0),
      );
      setRecruitments(sorted);

      if (sorted.length === 0) {
        setSelectedPeriod(null);
        setApplicants([]);
        setPage(0);
        setTotalPages(0);
        return;
      }

      setSelectedPeriod((prev) => {
        if (prev != null && sorted.some((item) => item.periodNumber === prev)) {
          return prev;
        }
        return sorted[0]?.periodNumber ?? null;
      });
    } catch (error) {
      console.error(error);
      toast.error("모집 기수 정보를 불러오지 못했습니다.");
    }
  }, []);

  const loadApplicants = useCallback(
    async (periodNumber: number, targetPage = 0) => {
      setIsLoading(true);
      try {
        const response = await getApplicantsByPeriod(periodNumber, targetPage, pageSize, appliedFilters);
        setApplicants(response.content);
        setPage(response.number ?? targetPage);
        setTotalPages(response.totalPages ?? 0);
        setTotalElements(response.totalElements ?? 0);
      } catch (error) {
        console.error(error);
        toast.error("지원자 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize, appliedFilters],
  );

  useEffect(() => {
    loadRecruitments();
  }, [loadRecruitments]);

  useEffect(() => {
    if (selectedPeriod != null) {
      loadApplicants(selectedPeriod, 0);
    }
  }, [selectedPeriod, loadApplicants]);

  const openDetail = async (applicant: ApplicantSummary, openReturn = false) => {
    setDetailModal({
      applicant,
      isLoading: true,
      showReturn: openReturn,
      returnReason: "",
      selectedFields: createProblemFieldSet(applicant.problemFields),
    });
    try {
      const detail = await getApplicantById(applicant.id);
      setDetailModal((prev) =>
        prev
          ? {
              ...prev,
              detail,
              isLoading: false,
              selectedFields: createProblemFieldSet(detail.problemFields),
            }
          : prev,
      );
    } catch (error) {
      console.error(error);
      toast.error("지원자 상세 정보를 불러오지 못했습니다.");
      setDetailModal(null);
    }
  };

  const closeDetail = () => {
    setDetailModal(null);
  };

  const runAction = async (
    action: (id: number) => Promise<unknown>,
    applicant: ApplicantSummary,
    successMessage: string,
  ) => {
    setIsProcessing(true);
    try {
      await action(applicant.id);
      toast.success(successMessage);
      closeDetail();
      if (selectedPeriod != null) {
        loadApplicants(selectedPeriod, page);
      }
    } catch (error) {
      console.error(error);
      toast.error("처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturnSubmit = async () => {
    if (!detailModal) return;
    if (!detailModal.returnReason.trim()) {
      toast.error("반려 사유를 입력해 주세요.");
      return;
    }
    if (detailModal.selectedFields.size === 0) {
      toast.error("수정이 필요한 항목을 선택해 주세요.");
      return;
    }

    setIsProcessing(true);
    try {
      await returnApplicant(detailModal.applicant.id, {
        returnReason: detailModal.returnReason,
        problemFields: Array.from(detailModal.selectedFields),
      });
      toast.success("수정요청이 등록되었습니다.");
      closeDetail();
      if (selectedPeriod != null) {
        loadApplicants(selectedPeriod, page);
      }
    } catch (error) {
      console.error(error);
      toast.error("수정요청 처리에 실패했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const recruitmentOptions = useMemo(() => {
    return recruitments.map((recruitment) => {
      return {
        value: recruitment.periodNumber,
        label: `제 ${recruitment.periodNumber}기`,
      };
    });
  }, [recruitments]);

  const handlePeriodChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const nextPeriod = value === "" ? null : Number(value);
    setSelectedPeriod(nextPeriod);
    setPage(0);
  };

  const handleApplyFilters = (event: FormEvent) => {
    event.preventDefault();
    const filters: AppliedFilters = {};

    if (statusFilter !== 'ALL') filters.status = statusFilter;
    if (zoneFilter !== 'ALL') filters.zone = zoneFilter;
    if (nameFilter) filters.name = nameFilter;
    if (fromFilter) filters.from = fromFilter;
    if (toFilter) filters.to = toFilter;

    setAppliedFilters(filters);
    setPage(0);
  };

  const handleReset = () => {
    setStatusFilter('ALL');
    setZoneFilter('ALL');
    setNameFilter('');
    setFromFilter('');
    setToFilter('');
    setAppliedFilters({});
    setPage(0);
  };

  const renderDetailModal = () => {
    if (!detailModal) return null;
    const { applicant, detail, isLoading: detailLoading, showReturn, selectedFields, returnReason } = detailModal;
    const target = detail ?? applicant;
    const previousSubmission = detail?.previousSubmission;
    const problemFieldSet = createProblemFieldSet(detail?.problemFields ?? applicant.problemFields);
    const zoneChangeRequest = detail?.zoneChangeRequest ?? target.zoneChangeRequest;
    const zoneChangeAttachments = zoneChangeRequest?.attachments ?? [];
    const previousZoneChangeAttachments = previousSubmission?.zoneChangeRequest?.attachments ?? [];
    const zoneChangeProblem = problemFieldSet.has("zoneChangeRequest") || problemFieldSet.has("zoneChangeAttachments");
    const formatFieldValue = (
      keys: ApplicantProblemField[],
      raw: unknown,
    ): string => {
      if (raw == null || raw === "") return "-";

      if (keys.includes("appliedScales")) {
        const values = Array.isArray(raw) ? raw : [raw];
        const formatted = values
          .map((value) => gradeLevelLabelMap[value as keyof typeof gradeLevelLabelMap] ?? String(value))
          .filter((value) => value.length > 0);
        return formatted.length ? formatted.join("\n") : "-";
      }

      if (keys.includes("businessType")) {
        const value = raw as keyof typeof businessTypeLabelMap;
        return businessTypeLabelMap[value] ?? String(raw);
      }

      if (keys.includes("gender")) {
        const value = raw as keyof typeof genderLabelMap;
        return genderLabelMap[value] ?? String(raw);
      }

      if (keys.includes("personnel")) {
        if (Array.isArray(raw)) {
          const formatted = (raw as ApplicantPersonnel[])
            .map((item) => formatPersonnelItem(item))
            .filter((item) => item.length > 0);
          return formatted.length ? formatted.join("\n\n") : "-";
        }
        if (raw && typeof raw === "object") {
          return formatPersonnelItem(raw as ApplicantPersonnel);
        }
      }

      if (Array.isArray(raw)) {
        const formatted = raw.map((item) => formatFieldValue(keys, item)).filter((item) => item.length > 0);
        return formatted.length ? formatted.join(", ") : "-";
      }

      if (typeof raw === "object") {
        const entries = Object.entries(raw as Record<string, unknown>);
        if (!entries.length) return "-";
        return entries.map(([key, value]) => `${key}: ${value ?? ""}`).join("\n");
      }

      return String(raw);
    };

    const getPreviousValue = (keys: ApplicantProblemField[]): string | undefined => {
      if (!previousSubmission) return undefined;
      const snapshot = previousSubmission as unknown as Record<string, unknown>;
      for (const key of keys) {
        const snapshotKey = SNAPSHOT_FIELD_MAP[key];
        if (!snapshotKey) continue;
        const raw = snapshot[snapshotKey];
        if (raw == null) {
          continue;
        }
        if (Array.isArray(raw) && raw.length === 0) {
          continue;
        }
        if (typeof raw === "string" && raw.trim() === "") {
          continue;
        }
        return formatFieldValue(keys, raw);
      }
      return undefined;
    };

    const technicalCurrent = formatFieldValue(
      ["personnel"],
      detail?.personnel ?? target.personnel ?? [],
    );
    const technicalPrevious = getPreviousValue(["personnel"]);

    const toggleFields = (fieldKeys: ApplicantProblemField[]) => {
      if (!showReturn || fieldKeys.length === 0) return;
      setDetailModal((prev) => {
        if (!prev) return prev;
        const next = new Set(prev.selectedFields);
        const allSelected = fieldKeys.every((key) => next.has(key));
        fieldKeys.forEach((key) => {
          if (allSelected) {
            next.delete(key);
          } else {
            next.add(key);
          }
        });
        return { ...prev, selectedFields: next };
      });
    };

    interface FieldDescriptor {
      label: string;
      fieldKeys: ApplicantProblemField[];
      current: string;
      previous?: string;
    }

    const fieldSections: { title: string; fields: FieldDescriptor[] }[] = [
      {
        title: "기본 정보",
        fields: [
          {
            label: "전문분야",
            fieldKeys: ["specialty"],
            current: formatFieldValue(["specialty"], target.specialty ?? "-"),
            previous: getPreviousValue(["specialty"]),
          },
          {
            label: "신청인",
            fieldKeys: ["applicantName"],
            current: formatFieldValue(["applicantName"], target.applicantName ?? "-"),
            previous: getPreviousValue(["applicantName"]),
          },
          {
            label: "자격번호",
            fieldKeys: ["seumterId"],
            current: formatFieldValue(["seumterId"], target.seumterId ?? "-"),
            previous: getPreviousValue(["seumterId"]),
          },
          {
            label: "생년월일",
            fieldKeys: [],
            current: "-",
            previous: undefined,
          },
          {
            label: "성별",
            fieldKeys: ["gender"],
            current: formatFieldValue(["gender"], target.gender ?? "-"),
            previous: getPreviousValue(["gender"]),
          },
        ],
      },
      {
        title: "자격 · 교육 · 사업자 정보",
        fields: [
          {
            label: "사무소명",
            fieldKeys: [],
            current: target.officeName ?? "-",
            previous: undefined,
          },
          {
            label: "대표자",
            fieldKeys: [],
            current: "-",
            previous: undefined,
          },
          {
            label: "휴대전화",
            fieldKeys: [],
            current: "-",
            previous: undefined,
          },
          {
            label: "전화번호",
            fieldKeys: [],
            current: "-",
            previous: undefined,
          },
          {
            label: "팩스번호",
            fieldKeys: [],
            current: "-",
            previous: undefined,
          },
          {
            label: "이메일",
            fieldKeys: [],
            current: "-",
            previous: undefined,
          },
          {
            label: "사업자 유형",
            fieldKeys: ["businessType"],
            current: formatFieldValue(["businessType"], target.businessType ?? "-"),
            previous: getPreviousValue(["businessType"]),
          },
          {
            label: target.businessType === "CORPORATION" ? "법인등록번호" : "사업자등록번호",
            fieldKeys: ["registrationNumber"],
            current: formatFieldValue(["registrationNumber"], target.registrationNumber ?? "-"),
            previous: getPreviousValue(["registrationNumber"]),
          },
          {
            label: "건설기술용역업 등록번호",
            fieldKeys: ["engineeringServiceNumber1"],
            current: formatFieldValue(["engineeringServiceNumber1"], target.engineeringServiceNumber1 ?? "-"),
            previous: getPreviousValue(["engineeringServiceNumber1"]),
          },
          {
            label: "개설일자",
            fieldKeys: ["engineeringServiceRegisteredAt"],
            current: formatFieldValue(
              ["engineeringServiceRegisteredAt"],
              target.engineeringServiceRegisteredAt ?? "-",
            ),
            previous: getPreviousValue(["engineeringServiceRegisteredAt"]),
          },
          {
            label: "사무소주소",
            fieldKeys: ["officeAddress"],
            current: formatFieldValue(["officeAddress"], target.officeAddress ?? "-"),
            previous: getPreviousValue(["officeAddress"]),
          },
          {
            label: "세움터ID",
            fieldKeys: ["seumterId"],
            current: formatFieldValue(["seumterId"], target.seumterId ?? "-"),
            previous: getPreviousValue(["seumterId"]),
          },
          {
            label: "교육이수번호",
            fieldKeys: ["educationCompletionNumber"],
            current: formatFieldValue(["educationCompletionNumber"], target.educationCompletionNumber ?? "-"),
            previous: getPreviousValue(["educationCompletionNumber"]),
          },
        ],
      },
      {
        title: "신청 분야 및 기술인력",
        fields: [
          {
            label: "신청 분야(규모)",
            fieldKeys: ["appliedScales"],
            current: formatFieldValue(["appliedScales"], detail?.appliedScales ?? target.appliedScales ?? []),
            previous: getPreviousValue(["appliedScales"]),
          },
          {
            label: "소속 기술인력",
            fieldKeys: ["personnel"],
            current: technicalCurrent,
            previous: technicalPrevious,
          },
        ],
      },
    ];

    const renderField = ({ label, fieldKeys, current, previous }: FieldDescriptor) => {
      const isSelectable = showReturn && fieldKeys.length > 0;
      const checked = fieldKeys.length > 0 && fieldKeys.every((key) => selectedFields.has(key));
      const hasDifference = previous !== undefined && previous !== current;
      const isProblemField = fieldKeys.some((key) => problemFieldSet.has(key));
      const shouldHighlight = isProblemField && hasDifference;
      return (
        <div
          key={label}
          className={classNames(
            "rounded-lg border border-border-light px-4 py-3",
            shouldHighlight ? "border-primary/50 bg-primary/5" : undefined,
          )}
        >
          <div className="flex items-start gap-3">
            {isSelectable && (
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={checked}
                onChange={() => toggleFields(fieldKeys)}
                disabled={isProcessing}
              />
            )}
            <div>
              <p className="text-xs text-secondary">{label}</p>
              {shouldHighlight ? (
                <div className="mt-1 space-y-1 text-sm">
                  <div>
                    <span className="text-xs text-secondary">이전</span>
                    <p className="whitespace-pre-wrap text-sm text-secondary line-through decoration-red-400">
                      {previous}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-secondary">현재</span>
                    <p className="whitespace-pre-wrap text-sm text-heading">{current}</p>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm text-heading">{current}</p>
              )}
            </div>
          </div>
        </div>
      );
    };

    const currentAttachmentMap = new Map<
      ApplicantAttachmentType,
      NonNullable<ApplicantDetail['attachments']>[number]
    >();
    detail?.attachments?.forEach((attachment) => {
      currentAttachmentMap.set(attachment.type, attachment);
    });

    const previousAttachmentMap = new Map<ApplicantAttachmentType, ApplicantSubmissionAttachment>();
    previousSubmission?.attachments?.forEach((attachment) => {
      previousAttachmentMap.set(attachment.type, attachment);
    });

    const renderAttachments = () => {
      const attachmentKeys = ATTACHMENT_DISPLAY_ORDER as (keyof typeof ATTACHMENT_KEY_TO_TYPE)[];

      return (
        <ul className="space-y-3">
          {attachmentKeys.map((fieldKey) => {
            const attachmentType = ATTACHMENT_KEY_TO_TYPE[fieldKey];
            const currentAttachment = currentAttachmentMap.get(attachmentType);
            const previousAttachment = previousAttachmentMap.get(attachmentType);
            const currentName = currentAttachment?.originalFilename ?? null;
            const previousName = previousAttachment?.originalFilename ?? null;
            const hasDifference = currentName !== previousName;
            const isSelectable = showReturn;
            const checked = selectedFields.has(fieldKey);
            const isProblemField = problemFieldSet.has(fieldKey as ApplicantProblemField);
            const label = APPLICANT_ATTACHMENT_LABELS[fieldKey]?.label ?? fieldKey;
            const downloadUrl = (currentAttachment as { downloadUrl?: string } | undefined)?.downloadUrl;
            const showDiff = hasDifference && isProblemField;

            return (
              <li
                key={fieldKey}
                className={classNames(
                  "flex items-start justify-between gap-3 rounded-lg border border-border-light px-4 py-3",
                  showDiff ? "border-primary/50 bg-primary/5" : undefined,
                )}
              >
                <div className="flex items-start gap-3">
                  {isSelectable && (
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={checked}
                      onChange={() => toggleFields([fieldKey])}
                      disabled={isProcessing}
                    />
                  )}
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-heading">{label}</p>
                    {showDiff ? (
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <p className="text-xs text-secondary">이전 첨부</p>
                          <p className="text-sm text-secondary line-through decoration-red-400">
                            {previousName ?? "미제출"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-secondary">현재 첨부</p>
                          <p className="text-sm text-heading">{currentName ?? "미제출"}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-heading">{currentName ?? previousName ?? "미제출"}</p>
                    )}
                  </div>
                </div>
                {downloadUrl ? (
                  <span className="text-gray-400 cursor-not-allowed text-sm">
                    다운로드
                  </span>
                ) : (
                  <span className="text-sm">-</span>
                )}
              </li>
            );
          })}
        </ul>
      );
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
        <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[24px] bg-white p-8 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-heading">지원자 상세</h3>
              <p className="mt-1 text-sm text-secondary">
                지원 ID #{applicant.id} · 제 {applicant.periodNumber}기 · 신청인 {target.applicantName ?? "-"}
              </p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={closeDetail}>
              닫기
            </Button>
          </div>

          {detailLoading ? (
            <div className="mt-10 text-center text-secondary">불러오는 중...</div>
          ) : (
            <div className="mt-6 space-y-8">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-border-light px-4 py-3">
                  <p className="text-xs text-secondary">상태</p>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getApplicantStatusBadge(target.status)}`}>
                    {getManagementStatusLabel(target.status)}
                  </span>
                </div>
                <div className="rounded-lg border border-border-light px-4 py-3">
                  <p className="text-xs text-secondary">신청일</p>
                  <p className="text-sm text-heading">{formatDate(target.appliedAt ?? target.submittedAt)}</p>
                </div>
              </div>

              {fieldSections.map((section) => (
                <section key={section.title} className="space-y-3">
                  <h4 className="text-lg font-semibold text-heading">{section.title}</h4>
              <div className="grid gap-3 md:grid-cols-2">
                {section.fields.map((field) => renderField(field))}
              </div>
            </section>
          ))}

          {(zoneChangeRequest || showReturn || zoneChangeProblem) && (
            <section className="space-y-3">
              <h4 className="text-lg font-semibold text-heading">권역 변경 신청</h4>

              <div
                className={classNames(
                  "rounded-lg border px-4 py-3",
                  zoneChangeProblem ? "border-primary/50 bg-primary/5" : "border-border-light",
                )}
              >
                <div className="flex items-start gap-3">
                  {showReturn && (
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={selectedFields.has("zoneChangeRequest")}
                      onChange={() => toggleFields(["zoneChangeRequest"])}
                      disabled={isProcessing}
                    />
                  )}
                  <div className="space-y-1 text-sm">
                    <p className="text-xs text-secondary">신청 상태</p>
                    <p className="font-medium text-heading">
                      {zoneChangeRequest ? "신청" : "신청 없음"}
                    </p>
                    {zoneChangeRequest && (
                      <div className="space-y-2">
                        {zoneChangeRequest.zone && (
                          <div>
                            <p className="text-xs text-secondary">변경 권역</p>
                            <p className="text-sm text-heading">{zoneChangeRequest.zone}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-secondary">변경 사유</p>
                          <p className="whitespace-pre-wrap text-sm text-heading">
                            {zoneChangeRequest.description?.trim() || "사유 미입력"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-secondary">
                          {zoneChangeRequest.createdAt && (
                            <span>
                              신청 일시 {formatDate(zoneChangeRequest.createdAt)}
                            </span>
                          )}
                          {zoneChangeRequest.updatedAt && (
                            <span>
                              최근 수정 {formatDate(zoneChangeRequest.updatedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {!zoneChangeRequest && zoneChangeProblem && (
                      <p className="text-xs text-amber-600">
                        권역 변경 신청 정보가 없습니다. 감리자에게 신청 여부를 다시 확인해 주세요.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={classNames(
                  "rounded-lg border px-4 py-3",
                  zoneChangeProblem ? "border-primary/50 bg-primary/5" : "border-border-light",
                )}
              >
                <div className="flex items-start gap-3">
                  {showReturn && (
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={selectedFields.has("zoneChangeAttachments")}
                      onChange={() => toggleFields(["zoneChangeAttachments"])}
                      disabled={isProcessing}
                    />
                  )}
                  <div className="w-full space-y-2 text-sm">
                    <p className="text-xs text-secondary">첨부파일</p>
                    {zoneChangeProblem ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <p className="text-xs text-secondary">이전 첨부</p>
                          {previousZoneChangeAttachments.length > 0 ? (
                            <ul className="space-y-1 text-sm text-secondary">
                              {previousZoneChangeAttachments.map((attachment) => (
                                <li key={attachment.id} className="line-through decoration-red-400">
                                  {attachment.originalFilename}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-secondary line-through decoration-red-400">첨부 없음</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-secondary">현재 첨부</p>
                          {zoneChangeAttachments.length > 0 ? (
                            <ul className="space-y-2">
                              {zoneChangeAttachments.map((attachment) => (
                                <li
                                  key={attachment.id}
                                  className="flex items-center justify-between gap-3 rounded border border-border-light px-3 py-2"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm text-heading">
                                      {attachment.originalFilename}
                                    </p>
                                  </div>
                                  {attachment.downloadUrl ? (
                                    <span className="text-gray-400 cursor-not-allowed text-xs">
                                      다운로드
                                    </span>
                                  ) : (
                                    <span className="text-xs">-</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-heading">첨부 없음</p>
                          )}
                        </div>
                        {zoneChangeAttachments.length === 0 && (
                          <p className="text-xs text-amber-600">
                            권역 변경 첨부가 필요합니다. 감리자에게 증빙 업로드를 요청하세요.
                          </p>
                        )}
                      </div>
                    ) : zoneChangeAttachments.length > 0 ? (
                      <ul className="space-y-2">
                        {zoneChangeAttachments.map((attachment) => (
                          <li
                            key={attachment.id}
                            className="flex items-center justify-between gap-3 rounded border border-border-light px-3 py-2"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm text-heading">
                                {attachment.originalFilename}
                              </p>
                            </div>
                            {attachment.downloadUrl ? (
                              <span className="text-gray-400 cursor-not-allowed text-xs">
                                다운로드
                              </span>
                            ) : (
                              <span className="text-xs">-</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-secondary">첨부 없음</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="space-y-3">
            <h4 className="text-lg font-semibold text-heading">첨부파일</h4>
            {renderAttachments()}
          </section>

              {detail?.returnReason && (
                <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  <p className="font-medium">최근 수정요청</p>
                  <p className="mt-1 whitespace-pre-wrap">{detail.returnReason}</p>
                  {detail.problemFields && detail.problemFields.length > 0 && (
                    <ul className="mt-2 list-disc pl-5">
                      {detail.problemFields.map((field) => {
                        const normalized = normalizeProblemField(field);
                        return (
                          <li key={field}>
                            {APPLICANT_PROBLEM_FIELD_LABELS[normalized] ?? normalized}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              )}

              {showReturn && (
                <section className="rounded-[16px] border border-amber-200 bg-amber-50 px-4 py-4">
                  <h4 className="text-lg font-semibold text-amber-800">수정 요청 작성</h4>
                  <p className="mt-1 text-sm text-amber-700">
                    수정이 필요한 항목을 체크하고, 반려 사유를 입력해 주세요.
                  </p>
                  <label className="mt-4 flex flex-col gap-2 text-sm text-heading">
                    반려 사유
                    <textarea
                      rows={4}
                      value={returnReason}
                      onChange={(event) =>
                        setDetailModal((prev) =>
                          prev ? { ...prev, returnReason: event.target.value } : prev,
                        )
                      }
                      className="rounded border border-border-light px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="반려 사유를 입력하세요"
                    />
                  </label>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        setDetailModal((prev) =>
                          prev
                            ? {
                                ...prev,
                                showReturn: false,
                                returnReason: "",
                                selectedFields: createProblemFieldSet(detail?.problemFields),
                              }
                            : prev,
                        )
                      }
                    >
                      취소
                    </Button>
                    <Button type="button" onClick={handleReturnSubmit} disabled={isProcessing}>
                      {isProcessing ? "처리 중..." : "수정 요청"}
                    </Button>
                  </div>
                </section>
              )}

              <div className="flex flex-wrap items-center justify-end gap-3">
                {isArchitectSociety && (
                  <>
                    {(target.status === "PENDING" || target.status === "RESUBMITTED") && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          runAction(startApplicantReview, applicant, "검토를 시작했습니다.")
                        }
                        disabled={isProcessing}
                      >
                        검토 시작
                      </Button>
                    )}
                    {(target.status === "PENDING" || target.status === "REVIEWING" || target.status === "RESUBMITTED") && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => runAction(approveApplicant, applicant, "승인되었습니다.")}
                        disabled={isProcessing}
                      >
                        승인
                      </Button>
                    )}
                    {(target.status === "REVIEWING" || target.status === "RESUBMITTED") && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => runAction(rejectApplicant, applicant, "거절 처리되었습니다.")}
                        disabled={isProcessing}
                      >
                        거절
                      </Button>
                    )}
                    {(target.status === "PENDING" || target.status === "REVIEWING" || target.status === "RESUBMITTED" || target.status === "RETURNED") && !showReturn && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setDetailModal((prev) =>
                            prev ? { ...prev, showReturn: true } : prev,
                          )
                        }
                        disabled={isProcessing}
                      >
                        수정 요청
                      </Button>
                    )}
                  </>
                )}
                <button
                  type="button"
                  onClick={closeDetail}
                  className="h-9 px-3 bg-[#0D77DE] text-white rounded font-medium text-[15px] hover:bg-[#0B65BE] transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <section className="rounded-[20px] bg-white p-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[18px] font-bold text-heading">신청내역 조회</h1>
          <button
            type="button"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
            aria-label={isFilterExpanded ? '필터 접기' : '필터 펼치기'}
          >
            <svg
              className={`transform transition-transform duration-300 ${isFilterExpanded ? 'rotate-180' : ''}`}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isFilterExpanded ? 'max-h-[500px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'
          }`}
        >
          <form onSubmit={handleApplyFilters} className="bg-white">
          <div className="flex flex-col">
            {/* First Row: 기수 (셀렉트) | 상태 (셀렉트) | 권역 (셀렉트) */}
            <div className="flex items-center gap-2" style={{ borderTop: '1px solid #D2D2D2' }}>
              {/* Group 1: 기수 */}
              <div className="flex items-center gap-3 flex-1">
                <label htmlFor="recruitment-period-select" className="w-[100px] h-[50px] px-3 py-1.5 bg-[#EDF6FF] flex items-center text-[14px] font-semibold text-[#010101] tracking-[-0.35px] flex-shrink-0">
                  기수
                </label>
                <Select
                  id="recruitment-period-select"
                  value={selectedPeriod ?? ""}
                  onChange={handlePeriodChange}
                  disabled={recruitmentOptions.length === 0}
                  className="flex-1"
                  style={{ height: '36px', minHeight: '36px', maxHeight: '36px' }}
                >
                  {recruitmentOptions.length === 0 ? (
                    <option value="">등록된 모집공고가 없습니다.</option>
                  ) : (
                    recruitmentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))
                  )}
                </Select>
              </div>

              {/* Group 2: 상태 */}
              <div className="flex items-center gap-3 flex-1">
                <label htmlFor="statusFilter" className="w-[100px] h-[50px] px-3 py-1.5 bg-[#EDF6FF] flex items-center text-[14px] font-semibold text-[#010101] tracking-[-0.35px] flex-shrink-0">
                  상태
                </label>
                <Select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="flex-1"
                  style={{ height: '36px', minHeight: '36px', maxHeight: '36px' }}
                >
                  <option value="ALL">전체</option>
                  <option value="PENDING">대기</option>
                  <option value="REVIEWING">검토중</option>
                  <option value="APPROVED">승인</option>
                  <option value="REJECTED">승인불가</option>
                  <option value="RETURNED">보완요청</option>
                  <option value="RESUBMITTED">보완 검토중</option>
                </Select>
              </div>

              {/* Group 3: 권역 */}
              <div className="flex items-center gap-3 flex-1">
                <label htmlFor="zoneFilter" className="w-[100px] h-[50px] px-3 py-1.5 bg-[#EDF6FF] flex items-center text-[14px] font-semibold text-[#010101] tracking-[-0.35px] flex-shrink-0">
                  권역
                </label>
                <Select
                  id="zoneFilter"
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value as typeof zoneFilter)}
                  className="flex-1"
                  style={{ height: '36px', minHeight: '36px', maxHeight: '36px' }}
                >
                  <option value="ALL">전체 권역</option>
                  {ZONES.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Second Row: 신청인 | 기간 | 조회 | 초기화 */}
            <div className="flex items-center gap-3" style={{ borderTop: '1px solid #D2D2D2', borderBottom: '1px solid #D2D2D2' }}>
              <label htmlFor="nameFilter" className="w-[100px] h-[50px] px-3 py-1.5 bg-[#EDF6FF] flex items-center text-[14px] font-semibold text-[#010101] tracking-[-0.35px] flex-shrink-0">
                신청인
              </label>
              <TextField
                id="nameFilter"
                placeholder="신청인을 입력하세요"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="w-[180px]"
                style={{ height: '36px', minHeight: '36px', maxHeight: '36px' }}
              />

              <label htmlFor="fromFilter" className="w-[100px] h-[50px] px-3 py-1.5 bg-[#EDF6FF] flex items-center text-[14px] font-semibold text-[#010101] tracking-[-0.35px] flex-shrink-0">
                기간
              </label>
              <TextField
                id="fromFilter"
                type="date"
                value={fromFilter}
                onChange={(e) => setFromFilter(e.target.value)}
                className="w-[180px]"
                style={{ height: '36px', minHeight: '36px', maxHeight: '36px' }}
              />
              <span className="text-[14px] text-[#646F7C]">~</span>
              <TextField
                id="toFilter"
                type="date"
                value={toFilter}
                onChange={(e) => setToFilter(e.target.value)}
                className="w-[180px]"
                style={{ height: '36px', minHeight: '36px', maxHeight: '36px' }}
              />

              <Button type="submit" className="w-[100px] text-[14px] font-medium leading-[1.4] tracking-[-0.28px] text-white" style={{ height: '36px' }}>
                조회
              </Button>
              <Button type="button" variant="secondary" onClick={handleReset} className="w-[100px] text-[14px] font-medium leading-[1.4] tracking-[-0.28px] rounded-[4px]" style={{ height: '36px', backgroundColor: '#E9EBEE', color: '#646F7C' }}>
                초기화
              </Button>
            </div>
          </div>
          </form>
        </div>

        {/* Action Bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <span style={{ color: '#010101', fontSize: '18px', fontWeight: 500, lineHeight: 'normal', letterSpacing: '-0.45px' }}>총 게시물</span>
            <span style={{ color: '#0082FF', fontSize: '16px', fontWeight: 500, lineHeight: 'normal', letterSpacing: '-0.4px', marginLeft: '8px' }}>{totalElements}</span>
            <span style={{ color: '#010101', fontSize: '16px', fontWeight: 400, lineHeight: 'normal', letterSpacing: '-0.4px' }}>건</span>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => { toast.info('엑셀 다운로드 기능은 준비중입니다.'); }} className="flex items-center gap-[10px]" style={{ width: 'auto', flexShrink: 0, height: '36px', minHeight: '36px', maxHeight: '36px', borderRadius: '5px', border: '1px solid #186F3D', background: '#FFF', padding: '5px 10px', color: '#186F3D', fontSize: '14px', fontWeight: 600, lineHeight: '140%', letterSpacing: '-0.35px', whiteSpace: 'nowrap' }}>
              <Image src="/assets/landing/Group 3019.svg" alt="" width={18} height={18} />
              엑셀 다운로드
            </Button>
            <Select value={pageSize.toString()} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }} style={{ height: '36px', minHeight: '36px', maxHeight: '36px', width: '120px' }}>
              <option value="10">10개씩 보기</option>
              <option value="20">20개씩 보기</option>
              <option value="50">50개씩 보기</option>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="w-full overflow-hidden">
            <table className="min-w-full border-collapse text-sm">
              <caption className="sr-only">지원자 목록</caption>
              <thead className="bg-[#EDF6FF]">
                <tr className="h-12">
                  <th className="px-5 text-center text-[14px] font-semibold text-[#010101]">No.</th>
                  <th className="px-5 text-center text-[14px] font-semibold text-[#010101]">상태</th>
                  <th className="px-5 text-center text-[14px] font-semibold text-[#010101]">신청인</th>
                  <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '80px' }}>지역</th>
                  <th className="px-5 text-center text-[14px] font-semibold text-[#010101]" style={{ minWidth: '80px' }}>권역</th>
                  <th className="px-5 text-center text-[14px] font-semibold text-[#010101]">사무소명</th>
                  <th className="px-5 text-center text-[14px] font-semibold text-[#010101]">신청일</th>
                  <th className="px-5 text-center text-[14px] font-semibold text-[#010101]">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-neutral/70 text-[14px] text-heading">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-secondary">
                      불러오는 중...
                    </td>
                  </tr>
                ) : applicants.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-secondary">
                      지원자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  applicants.map((applicant) => {
                    const statusBadge = getApplicantStatusBadge(applicant.status);
                    const statusLabel = getManagementStatusLabel(applicant.status);
                    const regionLabel = applicant.region ?? "-";
                    const problemFieldsLabel = applicant.problemFields && applicant.problemFields.length > 0
                      ? applicant.problemFields
                          .map((field) => {
                            const normalized = normalizeProblemField(field);
                            return APPLICANT_PROBLEM_FIELD_LABELS[normalized] ?? normalized;
                          })
                          .join(', ')
                      : null;
                    return (
                      <tr key={applicant.id} className="bg-white hover:bg-gray-50">
                        <td className="px-5 py-4 align-middle text-center text-secondary">{applicant.id}</td>
                        <td className="px-5 py-4 align-middle">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge}`}
                            >
                              {statusLabel}
                            </span>
                            {problemFieldsLabel && (
                              <span className="text-xs text-amber-700">
                                수정 필요 항목: {problemFieldsLabel}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 align-middle text-center text-heading">{applicant.applicantName ?? '-'}</td>
                        <td className="px-5 py-4 align-middle text-center text-secondary">{regionLabel}</td>
                        <td className="px-5 py-4 align-middle text-center text-secondary">{applicant.zone ?? '-'}</td>
                        <td className="px-5 py-4 align-middle text-center text-secondary">
                          {applicant.officeName ?? '-'}
                        </td>
                        <td className="px-5 py-4 align-middle text-center text-secondary">
                          {formatDate(applicant.appliedAt ?? applicant.submittedAt)}
                        </td>
                        <td className="px-5 py-4 align-middle">
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => openDetail(applicant)}
                              disabled={isProcessing}
                            >
                              상세 보기
                            </Button>
                            {isArchitectSociety && applicant.status === 'PENDING' && (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  runAction(startApplicantReview, applicant, '검토를 시작했습니다.')
                                }
                                disabled={isProcessing}
                              >
                                검토 시작
                              </Button>
                            )}
                            {isArchitectSociety && (applicant.status === 'PENDING' ||
                              applicant.status === 'REVIEWING' ||
                              applicant.status === 'RESUBMITTED') && (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => runAction(approveApplicant, applicant, '승인되었습니다.')}
                                disabled={isProcessing}
                              >
                                승인
                              </Button>
                            )}
                            {isArchitectSociety && (applicant.status === 'REVIEWING' || applicant.status === 'RESUBMITTED') && (
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => runAction(rejectApplicant, applicant, '거절 처리되었습니다.')}
                                disabled={isProcessing}
                              >
                                거절
                              </Button>
                            )}
                            {isArchitectSociety && (applicant.status === 'PENDING' ||
                              applicant.status === 'REVIEWING' ||
                              applicant.status === 'RESUBMITTED' ||
                              applicant.status === 'RETURNED') && (
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => openDetail(applicant, true)}
                                disabled={isProcessing}
                              >
                                보완요청
                              </Button>
                            )}
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

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => {
            if (selectedPeriod != null) {
              setPage(newPage);
              loadApplicants(selectedPeriod, newPage);
            }
          }}
          isLoading={isLoading}
        />
      </section>

      {renderDetailModal()}
    </div>
  );
}
