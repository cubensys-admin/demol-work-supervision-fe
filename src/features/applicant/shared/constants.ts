import type {
  ApplicantAttachmentType,
  ApplicantAttachmentUploadKey,
  ApplicantBusinessType,
  ApplicantGender,
  ApplicantProblemField,
  GradeLevel,
} from "@/entities/applicant/model/types";

export interface ApplicantZoneOption {
  value: string;
  label: string;
  description?: string;
}

export const APPLICANT_ZONE_OPTIONS: ApplicantZoneOption[] = [
  {
    value: "서북권",
    label: "서북권",
    description: "종로·중·용산·은평·서대문·마포구",
  },
  {
    value: "동북권",
    label: "동북권",
    description: "성동·광진·동대문·중랑·성북·강북·도봉·노원구",
  },
  {
    value: "동남권",
    label: "동남권",
    description: "서초·강남·송파·강동구",
  },
  {
    value: "서남권",
    label: "서남권",
    description: "양천·강서·구로·금천·영등포·동작·관악구",
  },
];

export const APPLICANT_GENDER_OPTIONS: { value: ApplicantGender; label: string }[] = [
  { value: "MALE", label: "남성" },
  { value: "FEMALE", label: "여성" },
];

export const APPLICANT_SPECIALTY_OPTIONS: { value: string; label: string }[] = [
  { value: "건축사사무소", label: "건축사사무소" },
  { value: "건설엔지니어링사업자", label: "건설엔지니어링사업자" },
];

export const APPLICANT_BUSINESS_TYPE_OPTIONS: {
  value: ApplicantBusinessType;
  label: string;
}[] = [
  { value: "GENERAL", label: "일반" },
  { value: "CORPORATION", label: "법인" },
];

export const APPLICANT_GRADE_LEVEL_OPTIONS: { value: GradeLevel; label: string }[] = [
  { value: "1등급", label: "1등급 (면적 1,000㎡ 미만 · 높이 15m 미만)" },
  { value: "2등급", label: "2등급 (면적 1,000~3,000㎡ · 높이 15~25m)" },
  { value: "3등급", label: "3등급 (면적 3,000㎡ 이상 · 높이 25m 이상)" },
];

// 첨부파일 표시 순서
export const ATTACHMENT_DISPLAY_ORDER: ApplicantAttachmentUploadKey[] = [
  "applicationForm",
  "serviceRegistrationCertificate",
  "businessRegistrationCertificate",
  "administrativeSanctionCheck",
  "consentForm",
  "supervisorEducationCertificate",
  "technicianEducationCertificate",
];

export const APPLICANT_ATTACHMENT_LABELS: Record<
  ApplicantAttachmentUploadKey,
  { label: string; required: boolean }
> = {
  applicationForm: { label: "해체공사감리업무 등재신청서", required: true },
  serviceRegistrationCertificate: { label: "개설신고확인증(건설기술용역업 등록증)", required: true },
  businessRegistrationCertificate: { label: "사업자등록증", required: true },
  administrativeSanctionCheck: { label: "행정처분 조회서", required: true },
  consentForm: { label: "해체공사감리업무 수행 동의서", required: true },
  supervisorEducationCertificate: { label: "감리자 교육 이수증", required: false },
  technicianEducationCertificate: { label: "감리원 또는 기술인력 교육 이수증", required: false },
};

export const REQUIRED_ATTACHMENT_KEYS = Object.entries(
  APPLICANT_ATTACHMENT_LABELS,
)
  .filter(([, meta]) => meta.required)
  .map(([key]) => key as ApplicantAttachmentUploadKey);

export const ATTACHMENT_KEY_TO_TYPE: Record<
  ApplicantAttachmentUploadKey,
  ApplicantAttachmentType
> = {
  applicationForm: "APPLICATION_FORM",
  consentForm: "CONSENT_FORM",
  serviceRegistrationCertificate: "SERVICE_REGISTRATION_CERTIFICATE",
  businessRegistrationCertificate: "BUSINESS_REGISTRATION_CERTIFICATE",
  administrativeSanctionCheck: "ADMINISTRATIVE_SANCTION_CHECK",
  supervisorEducationCertificate: "SUPERVISOR_EDUCATION_CERTIFICATE",
  technicianEducationCertificate: "TECHNICIAN_EDUCATION_CERTIFICATE",
};

export const ATTACHMENT_TYPE_TO_KEY: Record<
  ApplicantAttachmentType,
  ApplicantAttachmentUploadKey | 'careerCertificates'
> = {
  APPLICATION_FORM: 'applicationForm',
  CONSENT_FORM: 'consentForm',
  SERVICE_REGISTRATION_CERTIFICATE: 'serviceRegistrationCertificate',
  CAREER_CERTIFICATE: 'careerCertificates',
  BUSINESS_REGISTRATION_CERTIFICATE: 'businessRegistrationCertificate',
  ADMINISTRATIVE_SANCTION_CHECK: 'administrativeSanctionCheck',
  SUPERVISOR_EDUCATION_CERTIFICATE: 'supervisorEducationCertificate',
  TECHNICIAN_EDUCATION_CERTIFICATE: 'technicianEducationCertificate',
};

export const APPLICANT_PROBLEM_FIELD_LABELS: Record<
  ApplicantProblemField,
  string
> = {
  remark: "자격번호",
  specialty: "전문분야",
  applicantName: "신청인",
  gender: "성별",
  seumterId: "세움터 ID",
  educationCompletionNumber: "감리자 교육이수번호",
  educationExpirationDate: "감리자 교육이수증 만료기간",
  officeAddress: "사무소 주소",
  zone: "권역",
  businessType: "사업자 유형",
  registrationNumber: "사업자등록번호",
  engineeringServiceNumber1: "건설기술용역업 등록번호 1",
  engineeringServiceNumber2: "건설기술용역업 등록번호 2",
  engineeringServiceNumber3: "건설기술용역업 등록번호 3",
  engineeringServiceRegisteredAt: "건설기술용역업 등록일자",
  appliedScales: "신청 분야(규모)",
  personnel: "소속 기술인력",
  applicationForm: "등재신청서 첨부",
  consentForm: "수행 동의서 첨부",
  serviceRegistrationCertificate: "개설신고확인증(건설기술용역업 등록증) 첨부",
  careerCertificates: "경력증명서 첨부",
  businessRegistrationCertificate: "사업자등록증 첨부",
  administrativeSanctionCheck: "행정처분 조회서 첨부",
  supervisorEducationCertificate: "감리자 교육 이수증 첨부",
  technicianEducationCertificate: "감리원 또는 기술인력 교육 이수증 첨부",
  zoneChangeRequest: "권역 변경 신청",
  zoneChangeAttachments: "권역 변경 첨부",
  corporateRegistrationNumber: "법인등록번호",
};
