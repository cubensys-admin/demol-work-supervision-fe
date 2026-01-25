export type ApplicantStatus =
  | "DRAFT"
  | "PENDING"
  | "REVIEWING"
  | "APPROVED"
  | "REJECTED"
  | "RETURNED"
  | "RESUBMITTED"
  | "WITHDRAWN";

export type ApplicantAssignmentStatus = "WAITING" | "CANDIDATE" | "SUPERVISING";

export type ApplicantGender = "MALE" | "FEMALE";

export type ApplicantBusinessType = "GENERAL" | "CORPORATION";

export type GradeLevel = "1등급" | "2등급" | "3등급";

export type ApplicantAttachmentType =
  | "APPLICATION_FORM"
  | "CONSENT_FORM"
  | "SERVICE_REGISTRATION_CERTIFICATE"
  | "CAREER_CERTIFICATE"
  | "BUSINESS_REGISTRATION_CERTIFICATE"
  | "ADMINISTRATIVE_SANCTION_CHECK"
  | "SUPERVISOR_EDUCATION_CERTIFICATE"
  | "TECHNICIAN_EDUCATION_CERTIFICATE";

export type ApplicantAttachmentUploadKey =
  | "applicationForm"
  | "consentForm"
  | "serviceRegistrationCertificate"
  | "businessRegistrationCertificate"
  | "administrativeSanctionCheck"
  | "supervisorEducationCertificate"
  | "technicianEducationCertificate";

export type ApplicantProblemField =
  | "remark"
  | "specialty"
  | "applicantName"
  | "gender"
  | "seumterId"
  | "educationCompletionNumber"
  | "educationExpirationDate"
  | "officeAddress"
  | "zone"
  | "businessType"
  | "registrationNumber"
  | "corporateRegistrationNumber"
  | "engineeringServiceNumber1"
  | "engineeringServiceNumber2"
  | "engineeringServiceNumber3"
  | "engineeringServiceRegisteredAt"
  | "appliedScales"
  | "personnel"
  | "applicationForm"
  | "consentForm"
  | "serviceRegistrationCertificate"
  | "careerCertificates"
  | "businessRegistrationCertificate"
  | "administrativeSanctionCheck"
  | "supervisorEducationCertificate"
  | "technicianEducationCertificate"
  | "zoneChangeRequest"
  | "zoneChangeAttachments";

export interface ApplicantAttachment {
  id: number;
  type: ApplicantAttachmentType;
  originalFilename: string;
  downloadUrl: string;
}

export interface ApplicantPersonnel {
  name: string;
  birthDate: string;
  gender: ApplicantGender;
  qualification: string;
  identifier?: string;
  careerCertificateAttachmentId?: number;
  careerCertificateOriginalFilename?: string;
  careerCertificateDownloadUrl?: string;
}

export type ApplicantAttachmentUploads = Partial<
  Record<ApplicantAttachmentUploadKey, File | Blob | null | undefined>
> & {
  careerCertificates?: (File | Blob)[];
  zoneChangeAttachments?: (File | Blob)[];
};

export interface ZoneChangeAttachment {
  id: number;
  originalFilename: string;
  downloadUrl: string;
}

export interface ZoneChangeRequest {
  id?: number;
  zone?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  attachments: ZoneChangeAttachment[];
}

export interface ZoneChangeRequestPayload {
  requested?: boolean;
  zone?: string;
  description?: string;
}

export interface SupervisorChangeAttachment {
  id?: number;
  fileLabel?: string;
  originalName?: string;
  downloadUrl?: string;
}

export interface SupervisorChangeAddPersonnel {
  name: string;
  birthDate: string;
  gender: ApplicantGender;
  qualification: string;
  identifier?: string;
}

export interface SupervisorChangeResponse {
  id: number;
  applicantId: number;
  changeType: 'TECH_PERSONNEL_UPDATE' | 'WITHDRAW';
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED';
  reviewerOrg?: 'CITY' | 'ARCHITECTS_ASSOC' | 'OTHER';
  removePersonnelIds?: string[];
  addPersonnel?: SupervisorChangeAddPersonnel[];
  reason?: string;
  requestedBy?: number;
  requestedByUsername?: string;
  requestedAt?: string;
  decidedBy?: number;
  decidedByUsername?: string;
  decidedAt?: string;
  decisionComment?: string;
  attachments?: SupervisorChangeAttachment[];
}

export interface ApplicantSummary {
  id: number;
  userId?: number;
  username?: string;
  fullName?: string;
  receiptNumber?: string;
  periodNumber: number;
  region?: string;
  zone?: string;
  status: ApplicantStatus;
  statusDescription?: string;
  assignmentStatus?: ApplicantAssignmentStatus;
  assignmentStatusDescription?: string;
  isSelected?: boolean;
  isActive?: boolean;
  isRecruiting?: boolean;
  supervisionCount?: number;
  remark?: string;
  specialty?: string;
  applicantName?: string;
  gender?: ApplicantGender;
  seumterId?: string;
  educationCompletionNumber?: string;
  educationExpirationDate?: string;
  officeName?: string;
  officeAddress?: string;
  businessType?: ApplicantBusinessType;
  registrationNumber?: string;
  corporateRegistrationNumber?: string;
  engineeringServiceNumber1?: string;
  engineeringServiceNumber2?: string;
  engineeringServiceNumber3?: string;
  engineeringServiceRegisteredAt?: string;
  appliedScales?: GradeLevel[];
  personnel?: ApplicantPersonnel[];
  problemFields?: ApplicantProblemField[];
  returnReason?: string;
  resubmitCount?: number;
  isReturned?: boolean;
  selectedAt?: string;
  submittedAt?: string;
  appliedAt?: string;
  updatedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  returnedAt?: string;
  resubmittedAt?: string;
  attachments?: ApplicantAttachment[];
  zoneChangeRequest?: ZoneChangeRequest;
}

export interface ApplicantSubmissionAttachment {
  type: ApplicantAttachmentType;
  originalFilename: string;
}

export interface ApplicantSubmissionSnapshot {
  remark?: string;
  specialty?: string;
  applicantName?: string;
  gender?: ApplicantGender;
  seumterId?: string;
  educationCompletionNumber?: string;
  officeAddress?: string;
  businessType?: ApplicantBusinessType;
  registrationNumber?: string;
  corporateRegistrationNumber?: string;
  engineeringServiceNumber1?: string;
  engineeringServiceNumber2?: string;
  engineeringServiceNumber3?: string;
  engineeringServiceRegisteredAt?: string;
  appliedScales?: GradeLevel[];
  personnel: ApplicantPersonnel[];
  attachments?: ApplicantSubmissionAttachment[];
  zoneChangeRequest?: ZoneChangeRequest;
}

export interface ApplicantDetail extends ApplicantSummary {
  previousSubmission?: ApplicantSubmissionSnapshot;
}

export interface ApplicantListResponse {
  content: ApplicantSummary[];
  number: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface ApplicantCreatePayload {
  periodNumber: number;
  zone: string;
  region?: string;
  applicantName: string;
  specialty: string;
  remark?: string;
  gender?: ApplicantGender;
  seumterId?: string;
  educationCompletionNumber?: string;
  educationExpirationDate?: string;
  officeName?: string;
  officeAddress?: string;
  businessType?: ApplicantBusinessType;
  registrationNumber?: string;
  corporateRegistrationNumber?: string;
  engineeringServiceNumber1?: string;
  engineeringServiceNumber2?: string;
  engineeringServiceNumber3?: string;
  engineeringServiceRegisteredAt?: string;
  appliedScales?: GradeLevel[];
  personnel?: ApplicantPersonnel[];
  zoneChangeRequest?: ZoneChangeRequestPayload;
}

export interface ApplicantUpdatePayload {
  remark?: string;
  specialty?: string;
  applicantName?: string;
  gender?: ApplicantGender;
  seumterId?: string;
  educationCompletionNumber?: string;
  educationExpirationDate?: string;
  officeName?: string;
  officeAddress?: string;
  zone?: string;
  region?: string;
  businessType?: ApplicantBusinessType;
  registrationNumber?: string;
  corporateRegistrationNumber?: string;
  engineeringServiceNumber1?: string;
  engineeringServiceNumber2?: string;
  engineeringServiceNumber3?: string;
  engineeringServiceRegisteredAt?: string;
  appliedScales?: GradeLevel[];
  personnel?: ApplicantPersonnel[];
  zoneChangeRequest?: ZoneChangeRequestPayload;
}

export type ApplicantResubmitPayload = ApplicantUpdatePayload;

export interface ApplicantReturnPayload {
  returnReason: string;
  problemFields: ApplicantProblemField[];
}
