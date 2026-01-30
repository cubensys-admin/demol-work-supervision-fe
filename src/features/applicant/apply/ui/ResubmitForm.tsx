'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { httpClient } from "@/shared/api/httpClient";

import { getApplicantById } from "@/features/applicant/api/getApplicantById";
import { resubmitApplication } from "@/features/applicant/api/resubmitApplication";
import { updateApplicant } from "@/entities/applicant/api";
import {
  APPLICANT_ATTACHMENT_LABELS,
  APPLICANT_BUSINESS_TYPE_OPTIONS,
  APPLICANT_GENDER_OPTIONS,
  APPLICANT_GRADE_LEVEL_OPTIONS,
  APPLICANT_PROBLEM_FIELD_LABELS,
  APPLICANT_SPECIALTY_OPTIONS,
  APPLICANT_ZONE_OPTIONS,
  ATTACHMENT_DISPLAY_ORDER,
} from "@/features/applicant/shared/constants";
import type {
  ApplicantAttachmentUploadKey,
  ApplicantAttachmentUploads,
  ApplicantBusinessType,
  ApplicantDetail,
  ApplicantGender,
  ApplicantProblemField,
  ApplicantResubmitPayload,
  GradeLevel,
} from "@/entities/applicant/model/types";
import { useAuthStore } from "@/shared/model/authStore";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { Radio } from "@/shared/ui/radio";
import { RadioGroup } from "@/shared/ui/radio-group";
import { SelectCard } from "@/shared/ui/select-card";
import { SelectCardGroup } from "@/shared/ui/select-card-group";
import { FileInput } from "@/shared/ui/file-input";

interface ResubmitFormProps {
  applicationId: number;
  mode?: 'resubmit' | 'edit';
}

interface TechnicalPersonnelRow {
  name: string;
  birthDate: string;
  gender: "" | ApplicantGender;
  qualification: string;
  identifier?: string;
  careerCertificateAttachmentId?: number;
  careerCertificateOriginalFilename?: string;
  careerCertificateDownloadUrl?: string;
}

interface ResubmitFormState {
  zone: string;
  remark: string;
  specialty: string;
  applicantName: string;
  gender: "" | ApplicantGender;
  seumterId: string;
  educationCompletionNumber: string;
  educationExpirationDate: string;
  officeAddress: string;
  businessType: "" | ApplicantBusinessType;
  registrationNumber: string;
  corporateRegistrationNumber: string;
  engineeringServiceNumber1: string;
  engineeringServiceNumber2: string;
  engineeringServiceNumber3: string;
  engineeringServiceRegisteredAt: string;
  appliedScales: GradeLevel[];
  technicalPersonnel: TechnicalPersonnelRow[];
  zoneChangeRequested: boolean;
  zoneChangeZone: string;
  zoneChangeDescription: string;
}

const defaultRow: TechnicalPersonnelRow = {
  name: "",
  birthDate: "",
  gender: "",
  qualification: "",
};

const initialAttachmentState = Object.fromEntries(
  Object.keys(APPLICANT_ATTACHMENT_LABELS).map((key) => [key, null]),
) as Record<ApplicantAttachmentUploadKey, File | null>;

const FORM_FIELD_TO_PROBLEM_KEYS: Partial<
  Record<keyof ResubmitFormState, ApplicantProblemField[]>
> = {
  zone: ["zone"],
  remark: ["remark"],
  specialty: ["specialty"],
  applicantName: ["applicantName"],
  gender: ["gender"],
  seumterId: ["seumterId"],
  educationCompletionNumber: ["educationCompletionNumber"],
  educationExpirationDate: ["educationExpirationDate"],
  officeAddress: ["officeAddress"],
  businessType: ["businessType"],
  registrationNumber: ["registrationNumber"],
  corporateRegistrationNumber: ["corporateRegistrationNumber"],
  engineeringServiceNumber1: ["engineeringServiceNumber1"],
  engineeringServiceNumber2: ["engineeringServiceNumber2"],
  engineeringServiceNumber3: ["engineeringServiceNumber3"],
  engineeringServiceRegisteredAt: ["engineeringServiceRegisteredAt"],
  appliedScales: ["appliedScales"],
  technicalPersonnel: ["personnel"],
  zoneChangeZone: ["zoneChangeRequest"],
  zoneChangeDescription: ["zoneChangeRequest"],
  zoneChangeRequested: ["zoneChangeRequest"],
};

const ALL_PROBLEM_FIELDS = Object.keys(APPLICANT_PROBLEM_FIELD_LABELS) as ApplicantProblemField[];

function toRows(source: ApplicantDetail["personnel"]): TechnicalPersonnelRow[] {
  if (!source || source.length === 0) {
    return [defaultRow];
  }

  const rows = source.map((item) => ({
    name: item.name ?? "",
    birthDate: item.birthDate ?? "",
    gender: item.gender ?? "",
    qualification: item.qualification ?? "",
    identifier: item.identifier ?? undefined,
    careerCertificateAttachmentId: item.careerCertificateAttachmentId ?? undefined,
    careerCertificateOriginalFilename: item.careerCertificateOriginalFilename ?? undefined,
    careerCertificateDownloadUrl: item.careerCertificateDownloadUrl ?? undefined,
  }));

  return rows.length > 0 ? rows : [defaultRow];
}

function createFormState(application: ApplicantDetail): ResubmitFormState {
  return {
    zone: application.zone ?? "",
    remark: application.remark ?? "",
    specialty: application.specialty ?? "",
    applicantName: application.applicantName ?? "",
    gender: application.gender ?? "",
    seumterId: application.seumterId ?? "",
    educationCompletionNumber: application.educationCompletionNumber ?? "",
    educationExpirationDate: application.educationExpirationDate ?? "",
    officeAddress: application.officeAddress ?? "",
    businessType: application.businessType ?? "",
    registrationNumber: application.registrationNumber ?? "",
    corporateRegistrationNumber: application.corporateRegistrationNumber ?? "",
    engineeringServiceNumber1: application.engineeringServiceNumber1 ?? "",
    engineeringServiceNumber2: application.engineeringServiceNumber2 ?? "",
    engineeringServiceNumber3: application.engineeringServiceNumber3 ?? "",
    engineeringServiceRegisteredAt: application.engineeringServiceRegisteredAt ?? "",
    appliedScales: application.appliedScales ? [...application.appliedScales] : [],
    technicalPersonnel: toRows(application.personnel ?? []),
    zoneChangeRequested: Boolean(application.zoneChangeRequest),
    zoneChangeZone: application.zoneChangeRequest?.zone ?? "",
    zoneChangeDescription: application.zoneChangeRequest?.description ?? "",
  };
}

export function ResubmitForm({ applicationId, mode = 'resubmit' }: ResubmitFormProps) {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const hydrate = useAuthStore((state) => state.hydrate);

  const isEditMode = mode === 'edit';

  const [application, setApplication] = useState<ApplicantDetail | null>(null);
  const [form, setForm] = useState<ResubmitFormState | null>(null);
  const [attachments, setAttachments] = useState<
    Record<ApplicantAttachmentUploadKey, File | null>
  >({
    ...initialAttachmentState,
  });
  const [careerCertificates, setCareerCertificates] = useState<(File | null)[]>([]);
  const [zoneChangeAttachments, setZoneChangeAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 중복 파일명 체크 함수
  const isDuplicateFilename = useCallback((
    filename: string,
    options?: {
      excludeAttachmentKey?: ApplicantAttachmentUploadKey;
      excludeCareerIndex?: number;
    }
  ) => {
    const { excludeAttachmentKey, excludeCareerIndex } = options ?? {};

    // 필수 첨부파일에서 중복 체크
    const attachmentFilenames = Object.entries(attachments)
      .filter(([key, file]) => file && key !== excludeAttachmentKey)
      .map(([, file]) => file!.name);

    // 경력증명서에서 중복 체크
    const careerFilenames = careerCertificates
      .filter((file, index): file is File => file !== null && index !== excludeCareerIndex)
      .map((file) => file.name);

    // 권역변경 첨부파일에서 중복 체크
    const zoneChangeFilenames = zoneChangeAttachments.map((file) => file.name);

    const allFilenames = [...attachmentFilenames, ...careerFilenames, ...zoneChangeFilenames];
    return allFilenames.includes(filename);
  }, [attachments, careerCertificates, zoneChangeAttachments]);

  // 첨부파일 변경 핸들러 (중복 체크 포함)
  const handleAttachmentChange = useCallback((key: ApplicantAttachmentUploadKey, file: File | null) => {
    if (file && isDuplicateFilename(file.name, { excludeAttachmentKey: key })) {
      toast.error('동일한 파일명이 이미 존재합니다. 다른 파일을 선택해 주세요.');
      return;
    }
    setAttachments((prev) => ({ ...prev, [key]: file }));
  }, [isDuplicateFilename]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleCareerCertificateDownload = useCallback(async (attachmentId: number, filename?: string) => {
    try {
      const response = await httpClient.get(
        `/api/applicants/${applicationId}/attachments/${attachmentId}`,
        { responseType: 'blob' }
      );

      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });

      const contentDisposition = response.headers['content-disposition'];
      let downloadFilename = filename || '경력증명서';
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
  }, [applicationId]);

  useEffect(() => {
    if (role !== "INSPECTOR") {
      setIsLoading(false);
      return;
    }

    const fetchApplication = async () => {
      setIsLoading(true);
      try {
        const data = await getApplicantById(applicationId);
        if (!isEditMode && data.status !== "RETURNED") {
          toast.error("반려된 신청만 보완할 수 있습니다.");
          router.push("/applicants-apply/status");
          return;
        }
        if (isEditMode && data.status !== "PENDING") {
          toast.error("대기중인 신청만 수정할 수 있습니다.");
          router.push("/applicants-apply/status");
          return;
        }
        setApplication(data);
        const nextForm = createFormState(data);
        setForm(nextForm);
        setCareerCertificates(nextForm.technicalPersonnel.map(() => null));
        setZoneChangeAttachments([]);
      } catch (error) {
        console.error(error);
        toast.error("신청 정보를 불러오는 중 오류가 발생했습니다.");
        router.push("/applicants-apply/status");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId, role, router, isEditMode]);

  const problemFieldSet = useMemo(() => {
    if (isEditMode) {
      return new Set<ApplicantProblemField>(ALL_PROBLEM_FIELDS);
    }
    if (!application?.problemFields) return new Set<ApplicantProblemField>();
    const normalized = (application.problemFields as Array<string>).map((field) => {
      if (field === "technicalPersonnel") return "personnel";
      if (field === "careerCertificate") return "careerCertificates";
      return field;
    });
    return new Set<ApplicantProblemField>(normalized as ApplicantProblemField[]);
  }, [application?.problemFields, isEditMode]);

  const flaggedAttachmentKeys = useMemo(() => {
    if (isEditMode) {
      return [] as ApplicantAttachmentUploadKey[];
    }
    return (Object.keys(APPLICANT_ATTACHMENT_LABELS) as ApplicantAttachmentUploadKey[]).filter((key) =>
      problemFieldSet.has(key as ApplicantProblemField),
    );
  }, [problemFieldSet, isEditMode]);

  const canEditZoneChange =
    isEditMode || problemFieldSet.has("zoneChangeRequest") || problemFieldSet.has("zoneChangeAttachments");

  const isEditable = (field: ApplicantProblemField) => isEditMode || problemFieldSet.has(field);

  const isFormFieldEditable = (field: keyof ResubmitFormState | string) => {
    const keys = FORM_FIELD_TO_PROBLEM_KEYS[field as keyof ResubmitFormState];
    if (!keys) return false;
    return isEditMode || keys.some((key) => problemFieldSet.has(key));
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!form) return;
    const { name, value } = event.target;
    if (!isFormFieldEditable(name)) return;
    setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!form) return;
    const { name, value } = event.target;
    if (!isFormFieldEditable(name)) return;
    setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleTechnicalRowChange = (
    index: number,
    field: keyof TechnicalPersonnelRow,
    value: string,
  ) => {
    setForm((prev) => {
      if (!prev || !isEditable("personnel")) return prev;
      const nextRows = prev.technicalPersonnel.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      );
      return { ...prev, technicalPersonnel: nextRows };
    });
  };

  // 경력증명서 변경 핸들러 (중복 체크 포함)
  const handleCareerCertificateChange = (index: number, file: File | null) => {
    if (!isEditable("personnel") && !problemFieldSet.has("careerCertificates")) {
      return;
    }
    if (file && isDuplicateFilename(file.name, { excludeCareerIndex: index })) {
      toast.error('동일한 파일명이 이미 존재합니다. 다른 파일을 선택해 주세요.');
      return;
    }
    setCareerCertificates((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  };

  const clearCareerCertificate = (index: number) => {
    if (!isEditable("personnel") && !problemFieldSet.has("careerCertificates")) {
      return;
    }
    if (!window.confirm('선택한 경력증명서를 삭제하시겠습니까?')) {
      return;
    }
    setCareerCertificates((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const addTechnicalRow = () => {
    if (!isEditable("personnel")) return;
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        technicalPersonnel: [...prev.technicalPersonnel, { ...defaultRow }],
      };
    });
    setCareerCertificates((prev) => [...prev, null]);
  };

  const removeTechnicalRow = (index: number) => {
    if (!isEditable("personnel")) return;
    if (!window.confirm('해당 인력 정보를 삭제하시겠습니까?')) {
      return;
    }
    setForm((prev) => {
      if (!prev) return prev;
      const nextRows = prev.technicalPersonnel.filter((_, rowIndex) => rowIndex !== index);
      return {
        ...prev,
        technicalPersonnel: nextRows.length > 0 ? nextRows : [defaultRow],
      };
    });
    setCareerCertificates((prev) => {
      const next = prev.filter((_, rowIndex) => rowIndex !== index);
      return next.length > 0 ? next : [null];
    });
  };

  const handleZoneChangeToggle = () => {
    if (!form || !canEditZoneChange) return;
    const nextRequested = !form.zoneChangeRequested;
    setForm({
      ...form,
      zoneChangeRequested: nextRequested,
      zoneChangeZone: nextRequested ? form.zoneChangeZone : "",
      zoneChangeDescription: nextRequested ? form.zoneChangeDescription : "",
    });
    if (!nextRequested) {
      setZoneChangeAttachments([]);
    }
  };

  const handleZoneChangeAttachmentsChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!canEditZoneChange) return;
    const files = event.target.files ? Array.from(event.target.files) : [];

    // 중복 파일명 체크 (권역변경 첨부파일 제외하고 체크)
    const duplicates = files.filter((file) => {
      const attachmentFilenames = Object.values(attachments)
        .filter((f): f is File => f !== null)
        .map((f) => f.name);
      const careerFilenames = careerCertificates
        .filter((f): f is File => f !== null)
        .map((f) => f.name);
      return [...attachmentFilenames, ...careerFilenames].includes(file.name);
    });

    if (duplicates.length > 0) {
      toast.error(`동일한 파일명이 이미 존재합니다: ${duplicates.map((f) => f.name).join(', ')}`);
      event.target.value = '';
      return;
    }

    setZoneChangeAttachments(files);
    event.target.value = "";
  };

  const removeZoneChangeAttachment = (index: number) => {
    if (!canEditZoneChange) return;
    setZoneChangeAttachments((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const missingAttachmentKeys = useMemo(() => {
    return flaggedAttachmentKeys.filter((key) => !attachments[key]);
  }, [attachments, flaggedAttachmentKeys]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!application || !form || isSubmitting) return;

    if (!isEditMode && problemFieldSet.size === 0) {
      toast.error("수정 대상 항목이 지정되지 않았습니다. 담당자에게 문의해 주세요.");
      return;
    }

    if (!isEditMode && missingAttachmentKeys.length > 0) {
      toast.error("요청된 첨부파일을 모두 업로드해 주세요.");
      return;
    }

    if (form && canEditZoneChange && !form.zoneChangeRequested && zoneChangeAttachments.length > 0) {
      toast.error("권역 변경 신청을 선택한 경우에만 첨부파일을 업로드할 수 있습니다.");
      return;
    }

    if (requiresZoneChangeAttachmentUpload && zoneChangeAttachments.length === 0) {
      toast.error("권역 변경 신청 첨부파일을 업로드해 주세요.");
      return;
    }

    if (form.educationCompletionNumber.trim() && !form.educationExpirationDate) {
      toast.error("감리자 교육이수증 만료기간을 입력해 주세요.");
      return;
    }

    const payload: ApplicantResubmitPayload = {};

    const assignIfEditable = <K extends keyof ApplicantResubmitPayload>(
      field: K,
      value: ApplicantResubmitPayload[K],
    ) => {
      if (isEditable(field as ApplicantProblemField)) {
        payload[field] = value;
      }
    };

    assignIfEditable("remark", form.remark.trim() || undefined);
    assignIfEditable("specialty", form.specialty.trim() || undefined);
    assignIfEditable("applicantName", form.applicantName.trim() || undefined);
    assignIfEditable(
      "gender",
      form.gender ? (form.gender as ApplicantGender) : undefined,
    );
    assignIfEditable("seumterId", form.seumterId.trim() || undefined);
    assignIfEditable(
      "educationCompletionNumber",
      form.educationCompletionNumber.trim() || undefined,
    );
    assignIfEditable(
      "educationExpirationDate",
      form.educationExpirationDate || undefined,
    );
    assignIfEditable("officeAddress", form.officeAddress.trim() || undefined);

    if (isEditable("businessType")) {
      payload.businessType = form.businessType
        ? (form.businessType as ApplicantBusinessType)
        : undefined;
    }

    assignIfEditable("registrationNumber", form.registrationNumber.trim() || undefined);
    assignIfEditable("corporateRegistrationNumber", form.corporateRegistrationNumber.trim() || undefined);
    assignIfEditable(
      "engineeringServiceNumber1",
      form.engineeringServiceNumber1.trim() || undefined,
    );
    assignIfEditable(
      "engineeringServiceNumber2",
      form.engineeringServiceNumber2.trim() || undefined,
    );
    assignIfEditable(
      "engineeringServiceNumber3",
      form.engineeringServiceNumber3.trim() || undefined,
    );
    assignIfEditable(
      "engineeringServiceRegisteredAt",
      form.engineeringServiceRegisteredAt || undefined,
    );

    if (isEditable("zone")) {
      const nextZone = form.zone.trim();
      if (!nextZone) {
        toast.error("수정할 권역을 선택해 주세요.");
        return;
      }
      payload.zone = nextZone;
    }

    if (isEditable("appliedScales")) {
      payload.appliedScales = [...form.appliedScales];
    }

    const personnelWithMeta = form.technicalPersonnel.map((row, index) => ({
      index,
      name: row.name.trim(),
      birthDate: row.birthDate.trim(),
      gender: row.gender,
      qualification: row.qualification.trim(),
      identifier: row.identifier,
      careerCertificateDownloadUrl: row.careerCertificateDownloadUrl,
      file: careerCertificates[index] ?? null,
    }));

    const activePersonnel = personnelWithMeta.filter(
      (row) =>
        row.name ||
        row.birthDate ||
        row.gender ||
        row.qualification ||
        row.identifier ||
        row.file,
    );

    if (isEditable("personnel")) {
      if (activePersonnel.length === 0) {
        toast.error("최소 한 명의 소속 기술인력을 등록해 주세요.");
        return;
      }
      const hasIncompleteRow = activePersonnel.some(
        (row) => !row.name || !row.birthDate || !row.gender || !row.qualification,
      );
      if (hasIncompleteRow) {
        toast.error("소속 기술인력 정보를 모두 입력해 주세요.");
        return;
      }

      payload.personnel = activePersonnel.map((row) => ({
        name: row.name,
        birthDate: row.birthDate,
        gender: row.gender as ApplicantGender,
        qualification: row.qualification,
        identifier: row.identifier ?? undefined,
      }));
    }

    const shouldUploadCareerCertificates =
      (!isEditMode && problemFieldSet.has("careerCertificates")) ||
      activePersonnel.some((row) => !row.careerCertificateDownloadUrl) ||
      careerCertificates.some((file) => file != null);

    if (shouldUploadCareerCertificates) {
      const isCareerCertificateMissing = activePersonnel.some((row) => row.file == null);
      if (isCareerCertificateMissing) {
        toast.error("소속 기술인력 경력증명서를 모두 업로드해 주세요.");
        return;
      }
    }

    const attachmentPayload: ApplicantAttachmentUploads = {};
    const attachmentKeysToProcess = isEditMode
      ? (Object.keys(APPLICANT_ATTACHMENT_LABELS) as ApplicantAttachmentUploadKey[])
      : flaggedAttachmentKeys;

    attachmentKeysToProcess.forEach((key) => {
      const file = attachments[key];
      if (file) {
        attachmentPayload[key] = file;
      }
    });

    if (shouldUploadCareerCertificates && activePersonnel.length > 0) {
      attachmentPayload.careerCertificates = activePersonnel.map((row) => row.file!) as File[];
    }

    if (canEditZoneChange && form.zoneChangeRequested && zoneChangeAttachments.length > 0) {
      attachmentPayload.zoneChangeAttachments = [...zoneChangeAttachments];
    }

    if (canEditZoneChange) {
      if (form.zoneChangeRequested) {
        if (!form.zoneChangeZone) {
          toast.error("변경할 권역을 선택해 주세요.");
          return;
        }
        const description = form.zoneChangeDescription.trim();
        payload.zoneChangeRequest = {
          requested: true,
          zone: form.zoneChangeZone,
          description: description || undefined,
        };
      } else if (application.zoneChangeRequest) {
        payload.zoneChangeRequest = { requested: false };
      }
    }

    if (
      Object.keys(payload).length === 0 &&
      Object.keys(attachmentPayload).length === 0
    ) {
      toast.error("수정할 항목이 없습니다. 입력 내용을 확인해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await updateApplicant(
          applicationId,
          payload,
          Object.keys(attachmentPayload).length > 0 ? attachmentPayload : undefined,
        );
        toast.success("신청 정보가 수정되었습니다.");
      } else {
        await resubmitApplication(applicationId, {
          payload,
          attachments: attachmentPayload,
        });
        toast.success("보완 내용이 제출되었습니다.");
      }
      router.push("/applicants-apply/status");
    } catch (error) {
      console.error(error);
      toast.error(isEditMode ? "신청 수정 중 오류가 발생했습니다." : "재제출 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEditZone = isEditable("zone");
  const canEditBusinessType = isEditable("businessType");
  const canEditGender = isEditable("gender");
  const canEditTechnical = isEditable("personnel");
  const canEditAppliedScales = isEditable("appliedScales");
  const requiresZoneChangeAttachmentUpload =
    !isEditMode && canEditZoneChange && !!form?.zoneChangeRequested && problemFieldSet.has("zoneChangeAttachments");

  const heroTitle = isEditMode ? '신청 정보 수정' : '재제출 요청 보완';
  const heroSubtitle = isEditMode
    ? '처리 대기 중인 신청 내용을 수정할 수 있습니다. 필요한 정보를 변경한 후 다시 제출해 주세요.'
    : '반려된 항목만 수정할 수 있습니다. 담당자가 지정한 항목을 확인하고 보완해 주세요.';

  if (role !== "INSPECTOR") {
    return (
      <div className="rounded-[20px] bg-[#FFF5F5] px-6 py-12 text-center text-red-600 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        감리자 계정으로 로그인 후 재제출할 수 있습니다.
      </div>
    );
  }

  if (isLoading || !application || !form) {
    return (
      <div className="rounded-[20px] bg-white px-6 py-12 text-center text-secondary shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      <section className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <h1 className="text-2xl font-semibold">{heroTitle}</h1>
        <p className="mt-1 text-sm text-secondary">{heroSubtitle}</p>
        {!isEditMode && (
          <div className="mt-4 rounded-lg bg-white/60 px-4 py-3 text-sm text-amber-700">
            <p className="font-medium">수정 대상</p>
            {problemFieldSet.size > 0 ? (
              <ul className="mt-1 list-disc pl-5">
                {Array.from(problemFieldSet).map((field) => (
                  <li key={field}>{APPLICANT_PROBLEM_FIELD_LABELS[field] ?? field}</li>
                ))}
              </ul>
            ) : (
              <p>지정된 수정 항목이 없습니다.</p>
            )}
          </div>
        )}
      </section>

      <section className="rounded-[20px] bg-white px-8 py-8 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h2 className="text-[20px] font-bold text-black">기본 정보</h2>
            <div className="my-4 h-px" style={{ backgroundColor: '#666666' }} />
            <div className="mt-4.5 grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                <span className="whitespace-nowrap">모집 기수 <span style={{ color: '#FF0A73' }}>*</span></span>
                <Input
                  value={application.periodNumber ? `제 ${application.periodNumber}기` : '-'}
                  disabled
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                />
              </label>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-heading">
                  <span className="whitespace-nowrap">권역 <span style={{ color: '#FF0A73' }}>*</span></span>
                </label>
                <SelectCardGroup
                  value={form.zone}
                  onChange={(value) => setForm((prev) => prev ? { ...prev, zone: value as string } : null)}
                  mode="single"
                  gridCols={4}
                  disabled={!canEditZone}
                  helperText={
                    !canEditZone
                      ? "수정 불가 항목입니다."
                      : form.zone
                        ? APPLICANT_ZONE_OPTIONS.find(opt => opt.value === form.zone)?.description
                        : undefined
                  }
                >
                  {APPLICANT_ZONE_OPTIONS.map((option) => (
                    <SelectCard key={option.value} value={option.value}>
                      {option.label}
                    </SelectCard>
                  ))}
                </SelectCardGroup>
              </div>
            </div>

            <div className="mt-4.5 grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                <span className="whitespace-nowrap">신청인 <span style={{ color: '#FF0A73' }}>*</span></span>
                <Input
                  name="applicantName"
                  value={form.applicantName}
                  onChange={handleInputChange}
                  readOnly={!isEditable("applicantName")}
                  disabled={!isEditable("applicantName")}
                  className={!isEditable("applicantName") ? "bg-gray-100" : undefined}
                />
              </label>

              <RadioGroup
                name="specialty"
                value={form.specialty}
                onChange={(value) => setForm((prev) => prev ? { ...prev, specialty: value } : prev)}
                label={<>전문분야 <span style={{ color: '#FF0A73' }}>*</span></>}
                disabled={!isEditable("specialty")}
              >
                {APPLICANT_SPECIALTY_OPTIONS.map((option) => (
                  <Radio key={option.value} value={option.value} label={option.label} />
                ))}
              </RadioGroup>
            </div>

            <div className="mt-4.5 grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                성별
                <Select
                  name="gender"
                  value={form.gender}
                  onChange={handleSelectChange}
                  disabled={!canEditGender}
                >
                  <option value="">선택하세요</option>
                  {APPLICANT_GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                자격번호
                <Input
                  name="remark"
                  value={form.remark}
                  onChange={handleInputChange}
                  placeholder="자격번호를 입력하세요"
                  readOnly={!isEditable("remark")}
                  disabled={!isEditable("remark")}
                  className={!isEditable("remark") ? "bg-gray-100" : undefined}
                  maxLength={50}
                />
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-[20px] font-bold text-black">자격 · 교육 · 사업자 정보</h3>
            <div className="my-4 h-px" style={{ backgroundColor: '#666666' }} />
            <div className="mt-4.5 grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                <span>세움터 ID <span style={{ color: '#FF0A73' }}>*</span></span>
                <Input
                  name="seumterId"
                  value={form.seumterId}
                  onChange={handleInputChange}
                  readOnly={!isEditable("seumterId")}
                  disabled={!isEditable("seumterId")}
                  className={!isEditable("seumterId") ? "bg-gray-100" : undefined}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                감리자 교육이수번호
                <Input
                  name="educationCompletionNumber"
                  value={form.educationCompletionNumber}
                  onChange={handleInputChange}
                  readOnly={!isEditable("educationCompletionNumber")}
                  disabled={!isEditable("educationCompletionNumber")}
                  className={!isEditable("educationCompletionNumber") ? "bg-gray-100" : undefined}
                />
              </label>
            </div>

            {form.educationCompletionNumber && (
              <div className="mt-4.5 grid gap-6 md:grid-cols-2">
                <div />
                <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                  감리자 교육이수증 만료기간
                  <Input
                    type="date"
                    name="educationExpirationDate"
                    value={form.educationExpirationDate}
                    onChange={handleInputChange}
                    readOnly={!isEditable("educationExpirationDate")}
                    disabled={!isEditable("educationExpirationDate")}
                    className={!isEditable("educationExpirationDate") ? "bg-gray-100" : undefined}
                  />
                </label>
              </div>
            )}

            <div className="mt-4.5 grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                <span>사업자 유형 <span style={{ color: '#FF0A73' }}>*</span></span>
                <Select
                  name="businessType"
                  value={form.businessType}
                  onChange={handleSelectChange}
                  disabled={!canEditBusinessType}
                >
                  <option value="">선택하세요</option>
                  {APPLICANT_BUSINESS_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                <span>사업자등록번호 <span style={{ color: '#FF0A73' }}>*</span></span>
                <Input
                  name="registrationNumber"
                  value={form.registrationNumber}
                  onChange={handleInputChange}
                  readOnly={!isEditable("registrationNumber")}
                  disabled={!isEditable("registrationNumber")}
                  className={!isEditable("registrationNumber") ? "bg-gray-100" : undefined}
                />
              </label>
            </div>

            {form.businessType === 'CORPORATION' && (
              <div className="mt-4.5 grid gap-6 md:grid-cols-2">
                <div />
                <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                  <span>법인등록번호 <span style={{ color: '#FF0A73' }}>*</span></span>
                  <Input
                    name="corporateRegistrationNumber"
                    value={form.corporateRegistrationNumber}
                    onChange={handleInputChange}
                    placeholder="법인등록번호"
                    maxLength={50}
                    readOnly={!isEditable("corporateRegistrationNumber")}
                    disabled={!isEditable("corporateRegistrationNumber")}
                    className={!isEditable("corporateRegistrationNumber") ? "bg-gray-100" : undefined}
                  />
                </label>
              </div>
            )}

            <div className="mt-4.5 space-y-4">
              <div className="flex flex-col gap-2 text-sm font-medium text-heading">
                <span>건설기술용역업 등록번호 <span style={{ color: '#FF0A73' }}>*</span></span>
                <div className="grid gap-3 md:grid-cols-4">
                  <Input
                    name="engineeringServiceNumber1"
                    value={form.engineeringServiceNumber1}
                    onChange={handleInputChange}
                    placeholder="등록번호 1"
                    readOnly={!isEditable("engineeringServiceNumber1")}
                    disabled={!isEditable("engineeringServiceNumber1")}
                    className={!isEditable("engineeringServiceNumber1") ? "bg-gray-100" : undefined}
                  />
                  <Input
                    name="engineeringServiceNumber2"
                    value={form.engineeringServiceNumber2}
                    onChange={handleInputChange}
                    placeholder="등록번호 2"
                    readOnly={!isEditable("engineeringServiceNumber2")}
                    disabled={!isEditable("engineeringServiceNumber2")}
                    className={!isEditable("engineeringServiceNumber2") ? "bg-gray-100" : undefined}
                  />
                  <Input
                    name="engineeringServiceNumber3"
                    value={form.engineeringServiceNumber3}
                    onChange={handleInputChange}
                    placeholder="등록번호 3"
                    readOnly={!isEditable("engineeringServiceNumber3")}
                    disabled={!isEditable("engineeringServiceNumber3")}
                    className={!isEditable("engineeringServiceNumber3") ? "bg-gray-100" : undefined}
                  />
                  <Input
                    type="date"
                    name="engineeringServiceRegisteredAt"
                    value={form.engineeringServiceRegisteredAt}
                    onChange={handleInputChange}
                    readOnly={!isEditable("engineeringServiceRegisteredAt")}
                    disabled={!isEditable("engineeringServiceRegisteredAt")}
                    className={!isEditable("engineeringServiceRegisteredAt") ? "bg-gray-100" : undefined}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4.5 grid gap-6">
              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                <span>사무소 주소 <span style={{ color: '#FF0A73' }}>*</span></span>
                <Input
                  name="officeAddress"
                  value={form.officeAddress}
                  onChange={handleInputChange}
                  readOnly={!isEditable("officeAddress")}
                  disabled={!isEditable("officeAddress")}
                  className={!isEditable("officeAddress") ? "bg-gray-100" : undefined}
                />
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-[20px] font-bold text-black">신청 분야(규모)</h3>
            <div className="my-4 h-px" style={{ backgroundColor: '#666666' }} />
            <SelectCardGroup
              value={form.appliedScales}
              onChange={(value) => setForm((prev) => prev ? { ...prev, appliedScales: value as GradeLevel[] } : null)}
              mode="multiple"
              helperText={canEditAppliedScales ? "적용되는 규모 등급을 모두 선택해 주세요. (복수 선택 가능)" : "수정 불가 항목입니다."}
              gridCols={3}
              disabled={!canEditAppliedScales}
            >
              {APPLICANT_GRADE_LEVEL_OPTIONS.map((option) => (
                <SelectCard key={option.value} value={option.value}>
                  {option.label}
                </SelectCard>
              ))}
            </SelectCardGroup>
          </div>

          <div>
            <h3 className="text-[20px] font-bold text-black">소속 기술인력</h3>
            <div className="my-4 h-px" style={{ backgroundColor: '#666666' }} />
            <p className="mt-1 text-sm text-secondary">
              각 인력의 성명, 생년월일, 성별, 자격과 경력증명서를 입력해 주세요. 필요 시 추가 버튼으로 인력을 더 등록할 수 있습니다.
            </p>
            <div className="mt-4 space-y-4">
              {form.technicalPersonnel.map((row, index) => {
                const file = careerCertificates[index] ?? null;
                return (
                  <div
                    key={index}
                    className="flex flex-col gap-4 rounded-lg border border-border-light p-4"
                  >
                    <div className="grid gap-3 md:grid-cols-5">
                      <Input
                        value={row.name}
                        onChange={(event) => handleTechnicalRowChange(index, "name", event.target.value)}
                        readOnly={!canEditTechnical}
                        disabled={!canEditTechnical}
                        placeholder="성명"
                        maxLength={50}
                        className={!canEditTechnical ? "bg-gray-100" : undefined}
                      />
                      <Input
                        type="date"
                        value={row.birthDate}
                        onChange={(event) => handleTechnicalRowChange(index, "birthDate", event.target.value)}
                        readOnly={!canEditTechnical}
                        disabled={!canEditTechnical}
                        placeholder="생년월일"
                        className={!canEditTechnical ? "bg-gray-100" : undefined}
                      />
                      <RadioGroup
                        name={`technical-gender-${index}`}
                        value={row.gender}
                        onChange={(value) => handleTechnicalRowChange(index, "gender", value)}
                        direction="horizontal"
                        centered
                      >
                        {APPLICANT_GENDER_OPTIONS.map((option) => (
                          <Radio key={option.value} value={option.value} label={option.label} disabled={!canEditTechnical} />
                        ))}
                      </RadioGroup>
                      <Input
                        value={row.qualification}
                        onChange={(event) => handleTechnicalRowChange(index, "qualification", event.target.value)}
                        readOnly={!canEditTechnical}
                        disabled={!canEditTechnical}
                        placeholder="해당 자격"
                        maxLength={50}
                        className={!canEditTechnical ? "bg-gray-100" : undefined}
                      />
                      <div className="flex flex-col gap-2">
                        {row.careerCertificateAttachmentId && !file && (
                          <div className="flex items-center justify-between gap-2 rounded border border-green-200 bg-green-50 px-3 py-2 text-xs">
                            <span className="truncate text-green-700" title={row.careerCertificateOriginalFilename}>
                              {row.careerCertificateOriginalFilename || '기존 경력증명서 등록됨'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCareerCertificateDownload(row.careerCertificateAttachmentId!, row.careerCertificateOriginalFilename)}
                              className="shrink-0 text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              다운로드
                            </button>
                          </div>
                        )}
                        <Input
                          type="file"
                          accept=".pdf,.hwp,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(event) => handleCareerCertificateChange(index, event.target.files?.[0] ?? null)}
                          disabled={!canEditTechnical}
                          className={!canEditTechnical ? "cursor-not-allowed bg-gray-100 text-secondary" : undefined}
                        />
                        {file && (
                          <div className="flex items-center justify-between gap-2 text-xs text-secondary">
                            <span className="truncate">새 파일: {file.name}</span>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="px-2 text-xs"
                              onClick={() => clearCareerCertificate(index)}
                              disabled={!canEditTechnical}
                            >
                              삭제
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => removeTechnicalRow(index)}
                        disabled={!canEditTechnical}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                );
              })}
              <Button type="button" variant="secondary" size="sm" onClick={addTechnicalRow} disabled={!canEditTechnical}>
                인력 추가
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-[20px] font-bold text-black">권역 변경 신청 (선택)</h3>
            <div className="my-4 h-px" style={{ backgroundColor: '#666666' }} />
            <div className="mt-4 space-y-4 rounded-lg border border-border-light p-4">
              <label className="flex items-center gap-3 text-sm font-medium text-heading">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={form.zoneChangeRequested}
                  onChange={handleZoneChangeToggle}
                  disabled={!canEditZoneChange}
                />
                권역 변경을 신청합니다.
              </label>

              {form.zoneChangeRequested && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-heading">
                      변경할 권역
                    </label>
                    <SelectCardGroup
                      value={form.zoneChangeZone}
                      onChange={(value) => setForm((prev) => prev ? { ...prev, zoneChangeZone: value as string } : null)}
                      mode="single"
                      gridCols={4}
                      disabled={!canEditZoneChange}
                      helperText={form.zoneChangeZone ? APPLICANT_ZONE_OPTIONS.find(opt => opt.value === form.zoneChangeZone)?.description : undefined}
                    >
                      {APPLICANT_ZONE_OPTIONS.map((option) => (
                        <SelectCard key={option.value} value={option.value}>
                          {option.label}
                        </SelectCard>
                      ))}
                    </SelectCardGroup>
                  </div>

                  <div className="space-y-2">
                    <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                      <span className="whitespace-nowrap">관련 첨부파일 <span style={{ color: '#FF0A73' }}>*</span></span>
                      <Input
                        type="file"
                        multiple
                        accept=".pdf,.hwp,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleZoneChangeAttachmentsChange}
                        disabled={!canEditZoneChange}
                        className={!canEditZoneChange ? "cursor-not-allowed bg-gray-100 text-secondary" : undefined}
                      />
                    </label>
                    {zoneChangeAttachments.length > 0 && (
                      <ul className="space-y-2 text-sm text-secondary">
                        {zoneChangeAttachments.map((file, index) => (
                          <li
                            key={`${file.name}-${index}`}
                            className="flex items-center justify-between gap-2 rounded border border-border-light px-3 py-2"
                          >
                            <span className="truncate">{file.name}</span>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="px-2 text-xs"
                              onClick={() => removeZoneChangeAttachment(index)}
                              disabled={!canEditZoneChange}
                            >
                              삭제
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-[20px] font-bold text-black">필수 첨부파일</h3>
              <span className="text-sm text-secondary">
                (허용 확장자: PDF, HWP, Word, JPG, PNG)
              </span>
            </div>
            <div className="my-4 h-px" style={{ backgroundColor: '#666666' }} />
            <div className="mt-4 space-y-4">
              {ATTACHMENT_DISPLAY_ORDER.map((key) => {
                const { label: labelText, required } = APPLICANT_ATTACHMENT_LABELS[key];
                const file = attachments[key];
                const canEditAttachment = isEditMode || flaggedAttachmentKeys.includes(key);

                return (
                  <div key={key} className="flex gap-2 justify-between">
                    <label className="text-sm font-medium text-heading">
                      {labelText}
                      {required && <span className="ml-1" style={{ color: '#FF0A73' }}>*</span>}
                    </label>
                    <FileInput
                      value={file}
                      onChange={(file) => handleAttachmentChange(key, file as File | null)}
                      accept=".pdf,.hwp,.doc,.docx,.jpg,.jpeg,.png"
                      width="400px"
                      disabled={!canEditAttachment}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => router.push("/applicants-apply/status")}>취소</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "제출 중..." : isEditMode ? "수정 내용 제출" : "보완 내용 제출"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
