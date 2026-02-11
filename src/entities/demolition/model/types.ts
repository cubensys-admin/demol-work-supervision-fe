export type DemolitionRequestType = 'RECOMMENDATION' | 'PRIORITY_DESIGNATION';

export type DemolitionRequestStatus =
  | 'INITIAL_REQUEST'
  | 'INITIAL_REJECTED'
  | 'RE_REQUEST'
  | 'VERIFICATION_REQUESTED'
  | 'VERIFICATION_COMPLETED'
  | 'VERIFICATION_REJECTED'
  | 'RECOMMENDATION_COMPLETED'
  | 'SUPERVISOR_ASSIGNED'
  | 'SUPERVISOR_COMPLETED'
  | 'CANCELLED';

export interface DistrictDemolitionRequestCreate {
  requestDate: string; // 감리 의뢰일자
  requestType?: DemolitionRequestType; // 요청 타입 (기본값 RECOMMENDATION)
  requestCategory?: string; // 의뢰 구분
  districtOffice: string; // 의뢰 구청명
  region: string; // 지역/구 명칭
  zone: string; // 권역 명칭
  residentialArea: string; // 주거지역
  officerName: string; // 담당자 이름
  officerPhone?: string; // 담당자 전화번호
  officerFax?: string; // 담당자 팩스번호
  officerEmail?: string; // 담당자 이메일
  ownerName: string; // 건축주 이름
  ownerOtherName?: string; // 건축주 그 외 이름
  ownerPhone?: string; // 건축주 전화번호
  ownerAddress?: string; // 건축주 주소
  siteAddress: string; // 해체 위치
  siteDetailAddress?: string; // 해체 위치 상세 주소
  applicationCategory?: string; // 신청 구분 (신고/허가)
  buildingUse?: string; // 건축물 용도
  totalFloorArea?: number; // 건축 연면적
  buildingArea?: number; // 건축면적
  siteArea?: number; // 대지면적
  floorsAbove?: string; // 지상 층수 (문자)
  floorsBelow?: string; // 지하 층수 (문자)
  structureType?: string; // 구조
  demolitionType?: string; // 해체공사 유형
  demolitionScale?: string; // 해체공사 건축물 규모
  demolitionPermitNumber1?: string; // 해체 허가(신고) 번호1
  demolitionPermitNumber2?: string; // 해체 허가(신고) 번호2
  demolitionPermitNumber3?: string; // 해체 허가(신고) 번호3
  demolitionPermitNumber4?: string; // 해체 허가(신고) 번호4
  demolitionPermitDate?: string; // 해체 허가(신고) 일자
  undergroundWork?: boolean; // 지하층 해체작업 포함 여부
  priorityDesignation?: boolean; // 우선지정 여부
  priorityReason?: string; // 우선지정 사유
  prioritySupervisorName?: string; // 우선지정 감리자명 (단일, 하위호환)
  supervisorId?: number; // 지정할 감리자 ID (단일, 하위호환)
  priorityDesignations?: PriorityDesignationRequest[]; // 우선지정 감리자 후보 목록 (1~5명)
  settled?: boolean; // 정산 완료 여부
}

export type AssignmentHistoryEventType =
  | 'SELECTED'
  | 'RELEASED'
  | 'CONFIRMED'
  | 'COMPLETED';

export interface AssignmentHistory {
  supervisorId?: number;
  supervisorName?: string;
  eventType: AssignmentHistoryEventType;
  reason?: string;
  createdAt: string;
}

export interface PriorityDesignationApplicant {
  applicantId?: number;
  userId?: number;
  applicantName?: string;
  username?: string;
  fullName?: string;
  officeAddress?: string; // 사무소 주소
  mobilePhone?: string; // 연락처(휴대전화)
  licenseNumber?: string; // 자격번호
  region?: string;
  zone?: string;
  specialty?: string;
  supervisionCount?: number;
  status?: string;
  assignmentStatus?: string;
  supervisorType?: string;
}

// 우선지정 감리자 요청 (1~5명)
export interface PriorityDesignationRequest {
  order: number; // 우선지정 순번 (1~5)
  applicantId?: number; // 우선지정 지원자 ID (선택)
  userId?: number; // 우선지정 감리자 사용자 ID (선택)
  supervisorName: string; // 우선지정 감리자명
  supervisorBirthdate?: string; // 우선지정 감리자 생년월일
  supervisorLicense?: string; // 우선지정 감리자 자격번호
  designationReason?: string; // 우선지정 사유
}

export interface PaginatedPriorityDesignationApplicant {
  content: PriorityDesignationApplicant[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface DemolitionRequestSummary {
  id: number;
  requestNumber: string;
  requestDate: string;
  periodNumber?: number;
  designationDate?: string; // 감리자 지정(수락) 일시
  requestType: DemolitionRequestType;
  status: DemolitionRequestStatus;
  statusDescription?: string;
  districtOffice?: string;
  region?: string;
  zone?: string;
  residentialArea?: string;
  supervisorName?: string;
  ownerName?: string; // 건축주명
  verificationRequestedAt?: string;
  verificationCompletedAt?: string;
  supervisorAssignedAt?: string;
  supervisorCompletedAt?: string;
  // Architect-specific fields
  siteAddress?: string; // 건축 위치(현장 주소)
  siteDetailAddress?: string; // 해체 위치 상세 주소
  associationFee?: number; // 실적회비
}

export interface DemolitionRequestDetail extends DemolitionRequestSummary {
  requestCategory?: string;
  officerName: string;
  officerPhone?: string;
  officerFax?: string;
  officerEmail?: string;
  ownerName: string;
  ownerOtherName?: string;
  ownerPhone?: string;
  ownerAddress?: string;
  siteAddress: string;
  siteDetailAddress?: string;
  region?: string;
  residentialArea?: string;
  applicationCategory?: string;
  buildingUse?: string;
  siteArea?: number;
  buildingArea?: number;
  totalFloorArea?: number;
  floorsAbove?: number;
  floorsBelow?: number;
  structureType?: string;
  undergroundWork?: boolean;
  demolitionType?: string;
  demolitionScale?: string;
  demolitionPermitNumber1?: string;
  demolitionPermitNumber2?: string;
  demolitionPermitNumber3?: string;
  demolitionPermitNumber4?: string;
  demolitionPermitDate?: string;
  priorityDesignation?: boolean;
  priorityReason?: string;
  prioritySupervisorName?: string;
  supervisorId?: number;
  priorityDesignations?: PriorityDesignationRequest[];
  supervisorUsername?: string;
  supervisorName?: string;
  supervisorEmail?: string;
  cancellationReason?: string;
  initialRejectionReason?: string;
  initialRejectedAt?: string;
  rejectionReason?: string;
  rejectionCount?: number;
  completionReport?: DemolitionCompletionReport;
  preRecommendedAt?: string;
  supervisorRecommendedAt?: string;
  supervisorAssignedAt?: string;
  supervisorCompletedAt?: string;
  assignmentHistories?: AssignmentHistory[];
  settled?: boolean;
  createdById?: number;
  createdByUsername?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedDemolitionRequestSummary {
  content: DemolitionRequestSummary[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface VerificationRejectionRequest {
  rejectionReason: string;
}

export interface CityInitialRejectRequest {
  reason: string;
}

// 실적회비 정보 입력 요청
export interface InspectorSettlementRequest {
  supervisionFee: number;
  paymentAmount: number;
  paymentCompleted?: boolean;
  paymentCompletedAt?: string;
  contractAmount: number;
  associationFee: number;
  contractorName: string;
  settled?: boolean;
}

// 감리 완료 보고 제출 요청 (첨부파일만)
export interface InspectorCompletionSubmitRequest {
  supervisionContent?: string;
}

// 기존 타입 유지 (하위 호환성)
export type InspectorCompletionReportRequest = InspectorSettlementRequest;

export interface DemolitionCompletionAttachment {
  id?: number;
  fileLabel?: string;
  originalName?: string;
  downloadUrl?: string;
}

export interface DemolitionCompletionReport {
  supervisionFee?: number;
  paymentAmount?: number;
  paymentCompleted?: boolean;
  paymentCompletedAt?: string;
  contractAmount?: number;
  associationFee?: number;
  contractorName?: string;
  settled?: boolean;
  attachments?: DemolitionCompletionAttachment[];
  createdAt?: string;
  updatedAt?: string;
}
