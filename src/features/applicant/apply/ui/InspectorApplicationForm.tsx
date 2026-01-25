'use client';

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { applyToRecruitment } from '@/features/applicant/apply/api/applyToRecruitment';
import { getActiveRecruitments } from '@/entities/recruitment/api/getRecruitments';
import type { Recruitment } from '@/entities/recruitment/model/types';
import type {
  ApplicantAttachmentUploadKey,
  ApplicantAttachmentUploads,
  ApplicantBusinessType,
  ApplicantCreatePayload,
  ApplicantGender,
  ApplicantPersonnel,
  GradeLevel,
} from '@/entities/applicant/model/types';
import { useAuthStore } from '@/shared/model/authStore';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Radio } from '@/shared/ui/radio';
import { RadioGroup } from '@/shared/ui/radio-group';
import { SelectCard } from '@/shared/ui/select-card';
import { SelectCardGroup } from '@/shared/ui/select-card-group';
import { FileInput } from '@/shared/ui/file-input';
import {
  APPLICANT_ATTACHMENT_LABELS,
  APPLICANT_BUSINESS_TYPE_OPTIONS,
  APPLICANT_GENDER_OPTIONS,
  APPLICANT_GRADE_LEVEL_OPTIONS,
  APPLICANT_SPECIALTY_OPTIONS,
  APPLICANT_ZONE_OPTIONS,
  REQUIRED_ATTACHMENT_KEYS,
} from '@/features/applicant/shared/constants';

interface TechnicalPersonnelRow {
  name: string;
  birthDate: string;
  gender: '' | ApplicantGender;
  qualification: string;
}

interface ApplyFormState {
  periodNumber: string;
  zone: string;
  remark: string;
  specialty: string;
  applicantName: string;
  gender: '' | ApplicantGender;
  seumterId: string;
  educationCompletionNumber: string;
  educationExpirationDate: string;
  officeAddress: string;
  businessType: '' | ApplicantBusinessType;
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
}

const defaultTechnicalPersonnelRow: TechnicalPersonnelRow = {
  name: '',
  birthDate: '',
  gender: '',
  qualification: '',
};

const initialCareerCertificateState: (File | null)[] = [null];

const initialFormState: ApplyFormState = {
  periodNumber: '',
  zone: '',
  remark: '',
  specialty: '',
  applicantName: '',
  gender: '',
  seumterId: '',
  educationCompletionNumber: '',
  educationExpirationDate: '',
  officeAddress: '',
  businessType: '',
  registrationNumber: '',
  corporateRegistrationNumber: '',
  engineeringServiceNumber1: '',
  engineeringServiceNumber2: '',
  engineeringServiceNumber3: '',
  engineeringServiceRegisteredAt: '',
  appliedScales: [],
  technicalPersonnel: [defaultTechnicalPersonnelRow],
  zoneChangeRequested: false,
  zoneChangeZone: '',
};

const initialAttachmentsState = Object.fromEntries(
  Object.keys(APPLICANT_ATTACHMENT_LABELS).map((key) => [key, null]),
) as Record<ApplicantAttachmentUploadKey, File | null>;

export function InspectorApplicationForm() {
  const role = useAuthStore((state) => state.role);
  const username = useAuthStore((state) => state.username);
  const hydrate = useAuthStore((state) => state.hydrate);
  const router = useRouter();

  const [form, setForm] = useState<ApplyFormState>(initialFormState);
  const [attachments, setAttachments] = useState<Record<ApplicantAttachmentUploadKey, File | null>>({
    ...initialAttachmentsState,
  });
  const [careerCertificates, setCareerCertificates] = useState<(File | null)[]>([...initialCareerCertificateState]);
  const [zoneChangeAttachments, setZoneChangeAttachments] = useState<File[]>([]);
  const [hasAgreedToPolicies, setHasAgreedToPolicies] = useState(false);
  const [activeRecruitments, setActiveRecruitments] = useState<Recruitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const loadRecruitments = useCallback(async () => {
    setIsLoading(true);
    try {
      const recruitments = await getActiveRecruitments();
      setActiveRecruitments(recruitments);

      setForm((prev) => {
        if (prev.periodNumber) {
          return prev;
        }
        const first = recruitments[0];
        return first ? { ...prev, periodNumber: String(first.periodNumber ?? '') } : prev;
      });
    } catch (error) {
      console.error(error);
      toast.error('모집공고 정보를 불러오지 못했습니다.');
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
    void loadRecruitments();
  }, [role, loadRecruitments]);

  // Load draft from localStorage when periodNumber changes
  useEffect(() => {
    const periodNumber = Number(form.periodNumber);
    if (!periodNumber || Number.isNaN(periodNumber) || !username) {
      return;
    }

    const storageKey = `applicant_draft_${username}_${periodNumber}`;
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setForm((prev) => ({
          ...prev,
          ...parsed,
          periodNumber: String(periodNumber), // Keep current period
        }));
        toast.success('임시저장된 데이터를 불러왔습니다.');
      } catch (error) {
        console.error('Failed to load draft from localStorage:', error);
      }
    }
  }, [form.periodNumber, username]);

  const resetForm = () => {
    const periodNumber = form.periodNumber;
    setForm({
      ...initialFormState,
      periodNumber,
    });
    setAttachments({ ...initialAttachmentsState });
    setCareerCertificates([...initialCareerCertificateState]);
    setZoneChangeAttachments([]);
    setHasAgreedToPolicies(false);

    // Clear localStorage draft
    if (username && periodNumber) {
      const storageKey = `applicant_draft_${username}_${periodNumber}`;
      localStorage.removeItem(storageKey);
    }
  };

  const handleSaveDraft = () => {
    if (isSavingDraft) return;

    const periodNumber = Number(form.periodNumber);
    if (!periodNumber || Number.isNaN(periodNumber)) {
      toast.error('지원할 기수를 선택해 주세요.');
      return;
    }

    if (!username) {
      toast.error('사용자 정보를 확인할 수 없습니다.');
      return;
    }

    setIsSavingDraft(true);

    try {
      const storageKey = `applicant_draft_${username}_${periodNumber}`;
      localStorage.setItem(storageKey, JSON.stringify(form));
      toast.success('임시저장이 완료되었습니다.');
    } catch (error) {
      console.error('Failed to save draft to localStorage:', error);
      toast.error('임시저장에 실패했습니다.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTechnicalPersonnelChange = (
    index: number,
    field: keyof TechnicalPersonnelRow,
    value: string,
  ) => {
    setForm((prev) => {
      const nextRows = prev.technicalPersonnel.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      );
      return { ...prev, technicalPersonnel: nextRows };
    });
  };

  const handleCareerCertificateChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setCareerCertificates((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  };

  const clearCareerCertificate = (index: number) => {
    if (!window.confirm('선택한 경력증명서를 삭제하시겠습니까?')) {
      return;
    }
    setCareerCertificates((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const addTechnicalPersonnelRow = () => {
    setForm((prev) => ({
      ...prev,
      technicalPersonnel: [...prev.technicalPersonnel, { ...defaultTechnicalPersonnelRow }],
    }));
    setCareerCertificates((prev) => [...prev, null]);
  };

  const removeTechnicalPersonnelRow = (index: number) => {
    if (!window.confirm('해당 인력 정보를 삭제하시겠습니까?')) {
      return;
    }
    setForm((prev) => {
      const nextRows = prev.technicalPersonnel.filter((_, rowIndex) => rowIndex !== index);
      return {
        ...prev,
        technicalPersonnel: nextRows.length > 0 ? nextRows : [defaultTechnicalPersonnelRow],
      };
    });
    setCareerCertificates((prev) => {
      const next = prev.filter((_, rowIndex) => rowIndex !== index);
      return next.length > 0 ? next : [...initialCareerCertificateState];
    });
  };

  const handleZoneChangeToggle = () => {
    setForm((prev) => {
      const nextRequested = !prev.zoneChangeRequested;
      if (!nextRequested) {
        setZoneChangeAttachments([]);
      }
      return {
        ...prev,
        zoneChangeRequested: nextRequested,
        zoneChangeZone: nextRequested ? prev.zoneChangeZone : '',
      };
    });
  };

  const handleZoneChangeAttachmentsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setZoneChangeAttachments(files);
    event.target.value = '';
  };

  const removeZoneChangeAttachment = (index: number) => {
    setZoneChangeAttachments((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const attachmentErrors = useMemo(() => {
    return REQUIRED_ATTACHMENT_KEYS.filter((key) => !attachments[key]);
  }, [attachments]);

  const hasRequiredAttachments = attachmentErrors.length === 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const periodNumber = Number(form.periodNumber);
    if (!periodNumber || Number.isNaN(periodNumber)) {
      toast.error('지원할 기수를 선택해 주세요.');
      return;
    }

    if (!form.zone.trim()) {
      toast.error('지원 권역을 선택해 주세요.');
      return;
    }

    if (!form.applicantName.trim()) {
      toast.error('신청인 이름을 입력해 주세요.');
      return;
    }

    if (!form.specialty.trim()) {
      toast.error('전문분야를 선택해 주세요.');
      return;
    }

    if (!form.seumterId.trim()) {
      toast.error('세움터 ID를 입력해 주세요.');
      return;
    }

    if (form.educationCompletionNumber.trim() && !form.educationExpirationDate) {
      toast.error('감리자 교육이수증 만료기간을 입력해 주세요.');
      return;
    }

    if (!form.businessType) {
      toast.error('사업자 유형을 선택해 주세요.');
      return;
    }

    if (!form.registrationNumber.trim()) {
      toast.error('사업자등록번호를 입력해 주세요.');
      return;
    }

    if (form.businessType === 'CORPORATION' && !form.corporateRegistrationNumber.trim()) {
      toast.error('법인등록번호를 입력해 주세요.');
      return;
    }

    if (!form.engineeringServiceNumber1.trim() || !form.engineeringServiceNumber2.trim() || !form.engineeringServiceNumber3.trim()) {
      toast.error('건설기술용역업 등록번호를 모두 입력해 주세요.');
      return;
    }

    if (!form.engineeringServiceRegisteredAt) {
      toast.error('건설기술용역업 등록일자를 입력해 주세요.');
      return;
    }

    if (!form.officeAddress.trim()) {
      toast.error('사무소 주소를 입력해 주세요.');
      return;
    }

    if (!hasRequiredAttachments) {
      toast.error('필수 첨부파일을 모두 업로드해 주세요.');
      return;
    }

    if (!form.zoneChangeRequested && zoneChangeAttachments.length > 0) {
      toast.error('권역 변경 신청을 선택한 경우에만 첨부파일을 업로드할 수 있습니다.');
      return;
    }

    if (form.zoneChangeRequested && !form.zoneChangeZone) {
      toast.error('변경할 권역을 선택해 주세요.');
      return;
    }

    if (form.zoneChangeRequested && zoneChangeAttachments.length === 0) {
      toast.error('권역 변경 신청 시 첨부파일이 필수입니다.');
      return;
    }

    if (!hasAgreedToPolicies) {
      toast.error('약관에 동의해야 제출할 수 있습니다.');
      return;
    }

    const personnelWithFiles = form.technicalPersonnel.map((row, index) => ({
      name: row.name.trim(),
      birthDate: row.birthDate.trim(),
      gender: row.gender,
      qualification: row.qualification.trim(),
      file: careerCertificates[index] ?? null,
    }));

    const filledPersonnel = personnelWithFiles.filter(
      (row) => row.name || row.birthDate || row.gender || row.qualification || row.file,
    );

    if (filledPersonnel.length === 0) {
      toast.error('소속 기술인력을 최소 1명 입력해 주세요.');
      return;
    }

    const hasIncompleteRow = filledPersonnel.some(
      (row) =>
        !row.name || !row.birthDate || !row.gender || !row.qualification || row.file == null,
    );

    if (hasIncompleteRow) {
      toast.error('소속 기술인력 정보와 경력증명서를 모두 입력해 주세요.');
      return;
    }

    const personnelPayload: ApplicantPersonnel[] = filledPersonnel.map((row) => ({
      name: row.name,
      birthDate: row.birthDate,
      gender: row.gender as ApplicantGender,
      qualification: row.qualification,
    }));

    const payload: ApplicantCreatePayload = {
      periodNumber,
      zone: form.zone.trim(),
      applicantName: form.applicantName.trim(),
      specialty: form.specialty.trim(),
      remark: form.remark.trim() || undefined,
      gender: form.gender ? (form.gender as ApplicantGender) : undefined,
      seumterId: form.seumterId.trim() || undefined,
      educationCompletionNumber: form.educationCompletionNumber.trim() || undefined,
      educationExpirationDate: form.educationExpirationDate || undefined,
      officeAddress: form.officeAddress.trim() || undefined,
      businessType: form.businessType ? (form.businessType as ApplicantBusinessType) : undefined,
      registrationNumber: form.registrationNumber.trim() || undefined,
      corporateRegistrationNumber: form.corporateRegistrationNumber.trim() || undefined,
      engineeringServiceNumber1: form.engineeringServiceNumber1.trim() || undefined,
      engineeringServiceNumber2: form.engineeringServiceNumber2.trim() || undefined,
      engineeringServiceNumber3: form.engineeringServiceNumber3.trim() || undefined,
      engineeringServiceRegisteredAt: form.engineeringServiceRegisteredAt || undefined,
      appliedScales: form.appliedScales.length > 0 ? form.appliedScales : [],
      personnel: personnelPayload.length > 0 ? personnelPayload : undefined,
    };

    if (form.zoneChangeRequested) {
      payload.zoneChangeRequest = {
        requested: true,
        zone: form.zoneChangeZone || undefined,
      };
    }

    const attachmentPayload: ApplicantAttachmentUploads = {};
    (Object.keys(attachments) as ApplicantAttachmentUploadKey[]).forEach((key) => {
      const file = attachments[key];
      if (file) {
        attachmentPayload[key] = file;
      }
    });

    attachmentPayload.careerCertificates = filledPersonnel.map((row) => row.file!) as File[];

    if (form.zoneChangeRequested && zoneChangeAttachments.length > 0) {
      attachmentPayload.zoneChangeAttachments = [...zoneChangeAttachments];
    }

    setIsSubmitting(true);
    try {
      await applyToRecruitment({ payload, attachments: attachmentPayload });
      toast.success('등재 신청이 접수되었습니다.');

      resetForm();
      await loadRecruitments();
      router.push('/applicants-apply/status');
    } catch (error) {
      console.error(error);
      toast.error('지원 과정에서 문제가 발생했습니다. 이미 지원했는지 확인해 주세요.');
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-[20px] bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <h1 className="text-2xl font-semibold text-heading">감리자 등재 신청</h1>
        <p className="mt-2 text-sm text-secondary">
          모집 중인 기수를 선택하고 필수 정보를 입력한 뒤 첨부파일을 업로드해 주세요.
        </p>
        <div className="mt-4 rounded-lg border border-border-light bg-gray-50 px-4 py-3">
          <label className="flex items-start gap-3 text-sm font-medium text-heading">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={hasAgreedToPolicies}
              onChange={(event) => setHasAgreedToPolicies(event.target.checked)}
            />
            <span>
              <span className="font-semibold">
                이용약관 및 책임의 한계와 법적고지, 개인정보처리방침을 확인하고 동의합니다.
              </span>
              <span className="mt-1 block text-xs text-secondary">
                동의해야 등재 신청을 제출할 수 있습니다.
              </span>
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-[20px] bg-white px-8 py-8 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h2 className="text-[20px] font-bold text-black">기본 정보</h2>
            <div className="my-4 h-px" style={{ backgroundColor: '#666666' }} />
            <div className="mt-4.5 grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                <span className="whitespace-nowrap">모집 기수 <span style={{ color: '#FF0A73' }}>*</span></span>
                <Select
                  name="periodNumber"
                  value={form.periodNumber}
                  onChange={handleSelectChange}
                  required
                >
                  <option value="">모집 기수를 선택하세요</option>
                  {activeRecruitments.map((recruitment) => (
                    <option key={recruitment.id} value={recruitment.periodNumber}>
                      제 {recruitment.periodNumber}기 · {recruitment.title}
                    </option>
                  ))}
                </Select>
              </label>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-heading">
                  <span className="whitespace-nowrap">권역 <span style={{ color: '#FF0A73' }}>*</span></span>
                </label>
                <SelectCardGroup
                  value={form.zone}
                  onChange={(value) => setForm((prev) => ({ ...prev, zone: value as string }))}
                  mode="single"
                  gridCols={4}
                  helperText={form.zone ? APPLICANT_ZONE_OPTIONS.find(opt => opt.value === form.zone)?.description : undefined}
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
                  placeholder="신청인 이름"
                  required
                />
              </label>

              <RadioGroup
                name="specialty"
                value={form.specialty}
                onChange={(value) => setForm((prev) => ({ ...prev, specialty: value }))}
                label={<>전문분야 <span style={{ color: '#FF0A73' }}>*</span></>}
              >
                {APPLICANT_SPECIALTY_OPTIONS.map((option) => (
                  <Radio key={option.value} value={option.value} label={option.label} />
                ))}
              </RadioGroup>
            </div>

            <div className="mt-4.5 grid gap-6 md:grid-cols-2">
              <RadioGroup
                name="gender"
                value={form.gender}
                onChange={(value) => setForm((prev) => ({ ...prev, gender: value as ApplicantGender }))}
                label="성별"
              >
                {APPLICANT_GENDER_OPTIONS.map((option) => (
                  <Radio key={option.value} value={option.value} label={option.label} />
                ))}
              </RadioGroup>

              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                자격번호
                <Input
                  name="remark"
                  value={form.remark}
                  onChange={handleInputChange}
                  placeholder="자격번호를 입력하세요"
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
                  placeholder="세움터 ID를 입력하세요"
                  maxLength={50}
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                감리자 교육이수번호
                <Input
                  name="educationCompletionNumber"
                  value={form.educationCompletionNumber}
                  onChange={handleInputChange}
                  placeholder="교육이수번호"
                  maxLength={50}
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
                  />
                </label>
              </div>
            )}

            <div className="mt-4.5 grid gap-6 md:grid-cols-2">
              <RadioGroup
                name="businessType"
                value={form.businessType}
                onChange={(value) => setForm((prev) => ({ ...prev, businessType: value as ApplicantBusinessType }))}
                label={<>사업자 유형 <span style={{ color: '#FF0A73' }}>*</span></>}
              >
                {APPLICANT_BUSINESS_TYPE_OPTIONS.map((option) => (
                  <Radio key={option.value} value={option.value} label={option.label} />
                ))}
              </RadioGroup>

              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                <span>사업자등록번호 <span style={{ color: '#FF0A73' }}>*</span></span>
                <Input
                  name="registrationNumber"
                  value={form.registrationNumber}
                  onChange={handleInputChange}
                  placeholder="사업자등록번호"
                  maxLength={50}
                  required
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
                    required
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
                    maxLength={50}
                    required
                  />
                  <Input
                    name="engineeringServiceNumber2"
                    value={form.engineeringServiceNumber2}
                    onChange={handleInputChange}
                    placeholder="등록번호 2"
                    maxLength={50}
                    required
                  />
                  <Input
                    name="engineeringServiceNumber3"
                    value={form.engineeringServiceNumber3}
                    onChange={handleInputChange}
                    placeholder="등록번호 3"
                    maxLength={50}
                    required
                  />
                  <Input
                    type="date"
                    name="engineeringServiceRegisteredAt"
                    value={form.engineeringServiceRegisteredAt}
                    onChange={handleInputChange}
                    required
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
                  placeholder="사무소 주소를 입력하세요"
                  required
                />
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-[20px] font-bold text-black">신청 분야(규모)</h3>
            <div className="my-4 h-px" style={{ backgroundColor: '#666666' }} />
            <SelectCardGroup
              value={form.appliedScales}
              onChange={(value) => setForm((prev) => ({ ...prev, appliedScales: value as GradeLevel[] }))}
              mode="multiple"
              helperText="적용되는 규모 등급을 모두 선택해 주세요. (복수 선택 가능)"
              gridCols={3}
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
                  <div key={index} className="flex flex-col gap-4 rounded-lg border border-border-light p-4">
                    <div className="grid gap-3 md:grid-cols-5">
                      <Input
                        name={`technical-name-${index}`}
                        value={row.name}
                        onChange={(event) =>
                          handleTechnicalPersonnelChange(index, 'name', event.target.value)
                        }
                        placeholder="성명"
                        maxLength={50}
                      />
                      <Input
                        name={`technical-birthDate-${index}`}
                        type="date"
                        value={row.birthDate}
                        onChange={(event) =>
                          handleTechnicalPersonnelChange(index, 'birthDate', event.target.value)
                        }
                        placeholder="생년월일"
                      />
                      <RadioGroup
                        name={`technical-gender-${index}`}
                        value={row.gender}
                        onChange={(value) =>
                          handleTechnicalPersonnelChange(index, 'gender', value)
                        }
                        direction="horizontal"
                        centered
                      >
                        {APPLICANT_GENDER_OPTIONS.map((option) => (
                          <Radio key={option.value} value={option.value} label={option.label} />
                        ))}
                      </RadioGroup>
                      <Input
                        name={`technical-qualification-${index}`}
                        value={row.qualification}
                        onChange={(event) =>
                          handleTechnicalPersonnelChange(index, 'qualification', event.target.value)
                        }
                        placeholder="해당 자격"
                        maxLength={50}
                      />
                      <div className="flex flex-col gap-2">
                        <Input
                          name={`technical-careerCertificate-${index}`}
                          type="file"
                          accept=".pdf,.hwp,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(event) => handleCareerCertificateChange(index, event)}
                        />
                        {file && (
                          <div className="flex items-center justify-between gap-2 text-xs text-secondary">
                            <span className="truncate">선택된 파일: {file.name}</span>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="px-2 text-xs"
                              onClick={() => clearCareerCertificate(index)}
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
                        onClick={() => removeTechnicalPersonnelRow(index)}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                );
              })}
              <Button type="button" variant="secondary" size="sm" onClick={addTechnicalPersonnelRow}>
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
                      onChange={(value) => setForm((prev) => ({ ...prev, zoneChangeZone: value as string }))}
                      mode="single"
                      gridCols={4}
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
            <h3 className="text-[20px] font-bold text-black">필수 첨부파일</h3>
            <div className="my-4 h-px" style={{ backgroundColor: '#666666' }} />
            <div className="mt-4 space-y-4">
              {(Object.keys(APPLICANT_ATTACHMENT_LABELS) as ApplicantAttachmentUploadKey[]).map((key) => {
                const { label: labelText, required } = APPLICANT_ATTACHMENT_LABELS[key];
                const file = attachments[key];

                return (
                  <div key={key} className="flex gap-2 justify-between">
                    <label className="text-sm font-medium text-heading">
                      {labelText}
                      {required && <span className="ml-1" style={{ color: '#FF0A73' }}>*</span>}
                    </label>
                    <FileInput
                      value={file}
                      onChange={(file) => setAttachments((prev) => ({ ...prev, [key]: file as File | null }))}
                      accept=".pdf,.hwp,.doc,.docx,.jpg,.png"
                      width="400px"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || isSubmitting}
            >
              {isSavingDraft ? '저장 중...' : '임시저장'}
            </Button>
            <Button type="submit" disabled={isSubmitting || isSavingDraft || !hasAgreedToPolicies}>
              {isSubmitting ? '제출 중...' : '등재 신청하기'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
