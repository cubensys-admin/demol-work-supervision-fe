'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  createDemolitionRequest,
  getDemolitionRequestById,
  searchPriorityDesignationCandidatesByArea,
  updateDemolitionRequest,
} from '@/entities/demolition/api';
import type {
  DistrictDemolitionRequestCreate,
  DemolitionRequestType,
  PriorityDesignationApplicant,
  PaginatedPriorityDesignationApplicant,
  DemolitionRequestDetail,
  PriorityDesignationRequest,
} from '@/entities/demolition/model/types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { SelectCard } from '@/shared/ui/select-card';
import { SelectCardGroup } from '@/shared/ui/select-card-group';
import { useAuthStore } from '@/shared/model/authStore';
import {
  APPLICATION_CATEGORY_OPTIONS,
  BUILDING_USE_OPTIONS,
  DEMOLITION_PERMIT_TYPE_OPTIONS,
  DEMOLITION_TYPE_OPTIONS,
  RESIDENTIAL_AREA_OPTIONS,
  STRUCTURE_TYPE_OPTIONS,
  PRIORITY_DESIGNATION_REASON_OPTIONS,
} from '@/features/demolition/request/model/constants';
import { APPLICANT_GRADE_LEVEL_OPTIONS, APPLICANT_ZONE_OPTIONS } from '@/features/applicant/shared/constants';

const mapApplicationToPermitType = (value: string) =>
  value === '허가' ? '해체허가' : value === '신고' ? '해체신고' : '';

const mapPermitTypeToApplication = (value: string) =>
  value === '해체허가' ? '허가' : value === '해체신고' ? '신고' : undefined;

const mapDetailToFormData = (
  detail: DemolitionRequestDetail,
): DistrictDemolitionRequestCreate => {
  const normalizedDate = detail.requestDate
    ? detail.requestDate.split('T')[0]
    : new Date().toISOString().split('T')[0];

  const normalizedApplication =
    detail.applicationCategory ?? mapPermitTypeToApplication(detail.demolitionPermitNumber3 ?? '') ?? '';

  const permitType =
    detail.demolitionPermitNumber3 ?? mapApplicationToPermitType(normalizedApplication) ?? '';

  const isPriorityType = detail.requestType === 'PRIORITY_DESIGNATION';
  const priorityDesignation = detail.priorityDesignation ?? isPriorityType;
  const priorityReason = priorityDesignation ? detail.priorityReason ?? '' : '';
  const prioritySupervisorName = priorityDesignation ? detail.prioritySupervisorName ?? '' : '';
  const supervisorId = priorityDesignation ? detail.supervisorId ?? undefined : undefined;

  return {
    requestDate: normalizedDate,
    requestType: detail.requestType ?? 'RECOMMENDATION',
    requestCategory: detail.requestCategory ?? '',
    districtOffice: detail.districtOffice ?? '',
    region: detail.region ?? '',
    zone: detail.zone ?? '',
    residentialArea: detail.residentialArea ?? '',
    officerName: detail.officerName ?? '',
    officerPhone: detail.officerPhone ?? '',
    officerFax: detail.officerFax ?? '',
    officerEmail: detail.officerEmail ?? '',
    ownerName: detail.ownerName ?? '',
    ownerOtherName: detail.ownerOtherName ?? '',
    ownerPhone: detail.ownerPhone ?? '',
    ownerAddress: detail.ownerAddress ?? '',
    siteAddress: detail.siteAddress ?? '',
    siteDetailAddress: detail.siteDetailAddress ?? '',
    applicationCategory: normalizedApplication,
    buildingUse: detail.buildingUse ?? '',
    totalFloorArea: detail.totalFloorArea ?? undefined,
    buildingArea: detail.buildingArea ?? undefined,
    siteArea: detail.siteArea ?? undefined,
    floorsAbove: detail.floorsAbove != null ? String(detail.floorsAbove) : '',
    floorsBelow: detail.floorsBelow != null ? String(detail.floorsBelow) : '',
    structureType: detail.structureType ?? '',
    demolitionType: detail.demolitionType ?? '',
    demolitionScale: detail.demolitionScale ?? '',
    demolitionPermitNumber1: detail.demolitionPermitNumber1 ?? '',
    demolitionPermitNumber2: detail.demolitionPermitNumber2 ?? '',
    demolitionPermitNumber3: permitType,
    demolitionPermitNumber4: detail.demolitionPermitNumber4 ?? '',
    demolitionPermitDate: detail.demolitionPermitDate ?? '',
    undergroundWork: detail.undergroundWork ?? false,
    priorityDesignation,
    priorityReason,
    prioritySupervisorName,
    supervisorId,
  };
};

const DECIMAL_FIELDS = new Set(['siteArea', 'buildingArea', 'totalFloorArea']);
const INTEGER_FIELDS = new Set(['supervisorId']);
const PRIORITY_CANDIDATE_PAGE_SIZE = 10;
const MAX_PRIORITY_DESIGNATIONS = 5;
const GRADE_LEVEL_LABEL_MAP = Object.fromEntries(
  APPLICANT_GRADE_LEVEL_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<string, string>;

type DaumPostcodeData = {
  address: string;
  roadAddress?: string;
  jibunAddress?: string;
  userSelectedType?: 'R' | 'J';
};

declare global {
  interface Window {
    daum?: {
      Postcode: new (config: { oncomplete: (data: DaumPostcodeData) => void }) => {
        open: () => void;
      };
    };
  }
}

const DAUM_POSTCODE_SCRIPT_ID = 'daum-postcode-script';

export function DemolitionRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = useAuthStore((state) => state.username);
  const userRegion = useAuthStore((state) => state.region);
  const userZone = useAuthStore((state) => state.zone);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPostcodeReady, setIsPostcodeReady] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [prioritySearchTerm, setPrioritySearchTerm] = useState('');
  const [priorityCandidates, setPriorityCandidates] = useState<PriorityDesignationApplicant[]>([]);
  const [priorityCandidatePage, setPriorityCandidatePage] = useState(0);
  const [priorityCandidateTotalPages, setPriorityCandidateTotalPages] = useState(0);
  const [isPriorityCandidatesLoading, setIsPriorityCandidatesLoading] = useState(false);
  const [priorityCandidatesError, setPriorityCandidatesError] = useState<string | null>(null);
  const [selectedPriorityCandidates, setSelectedPriorityCandidates] = useState<
    Array<{
      applicantId?: number;
      userId?: number;
      supervisorName: string;
      supervisorBirthdate?: string;
      supervisorLicense?: string;
    }>
  >([]);
  const [editRequestId, setEditRequestId] = useState<number | null>(null);
  const [isLoadingRequest, setIsLoadingRequest] = useState(false);
  const [formData, setFormData] = useState<DistrictDemolitionRequestCreate>({
    requestDate: new Date().toISOString().split('T')[0],
    requestType: 'RECOMMENDATION',
    requestCategory: '신청',
    districtOffice: '',
    region: '',
    zone: '',
    residentialArea: '',
    officerName: '',
    officerPhone: '',
    officerFax: '',
    officerEmail: '',
    ownerName: '',
    ownerOtherName: '',
    ownerPhone: '',
    ownerAddress: '',
    siteAddress: '',
    siteDetailAddress: '',
    applicationCategory: '',
    undergroundWork: false,
    buildingUse: '',
    totalFloorArea: undefined,
    buildingArea: undefined,
    siteArea: undefined,
    floorsAbove: '',
    floorsBelow: '',
    structureType: '',
    demolitionType: '',
    demolitionScale: '',
    demolitionPermitNumber1: '',
    demolitionPermitNumber2: '',
    demolitionPermitNumber3: '',
    demolitionPermitNumber4: '',
    demolitionPermitDate: '',
    priorityDesignation: false,
    priorityReason: '',
    prioritySupervisorName: '',
    supervisorId: undefined,
  });
  const isEditMode = editRequestId != null;

  useEffect(() => {
    if (!searchParams) {
      setEditRequestId(null);
      return;
    }

    const editParam = searchParams.get('editId');
    if (editParam) {
      const parsedEdit = Number(editParam);
      setEditRequestId(
        Number.isInteger(parsedEdit) && parsedEdit > 0 ? parsedEdit : null,
      );
    } else {
      setEditRequestId(null);
    }
  }, [searchParams]);

  useEffect(() => {
    setFormData((prev) => {
      let changed = false;
      const next = { ...prev };

      if (username && !prev.districtOffice) {
        next.districtOffice = username;
        changed = true;
      }

      if (userRegion && !prev.region) {
        next.region = userRegion;
        changed = true;
      }

      if (userZone && !prev.zone) {
        next.zone = userZone;
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [username, userRegion, userZone]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.daum?.Postcode) {
      setIsPostcodeReady(true);
      return;
    }

    const existingScript = document.getElementById(DAUM_POSTCODE_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      const handleLoad = () => {
        existingScript.dataset.loaded = 'true';
        setIsPostcodeReady(true);
      };

      if (existingScript.dataset.loaded === 'true') {
        setIsPostcodeReady(true);
        return;
      }

      existingScript.addEventListener('load', handleLoad);
      return () => {
        existingScript.removeEventListener('load', handleLoad);
      };
    }

    const script = document.createElement('script');
    script.id = DAUM_POSTCODE_SCRIPT_ID;
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      setIsPostcodeReady(true);
    };
    script.onerror = () => {
      console.error('Daum postcode script failed to load');
    };
    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;

    if (type === 'checkbox') {
      const checked = (event.target as HTMLInputElement).checked;

      if (name === 'priorityDesignation') {
        setFormData((prev) => ({
          ...prev,
          priorityDesignation: checked,
          ...(checked
            ? {}
            : { priorityReason: '', prioritySupervisorName: '', supervisorId: undefined }),
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
      return;
    }

    if (name === 'requestType') {
      const newType = value as DemolitionRequestType;
      setFormData((prev) => ({
        ...prev,
        requestType: newType,
        priorityDesignation: newType === 'PRIORITY_DESIGNATION',
        priorityReason: newType === 'PRIORITY_DESIGNATION' ? prev.priorityReason : '',
        prioritySupervisorName:
          newType === 'PRIORITY_DESIGNATION' ? prev.prioritySupervisorName : '',
        supervisorId: newType === 'PRIORITY_DESIGNATION' ? prev.supervisorId : undefined,
      }));
      return;
    }

    if (name === 'applicationCategory') {
      const permitType = mapApplicationToPermitType(value);
      setFormData((prev) => ({
        ...prev,
        applicationCategory: value,
        demolitionPermitNumber3: permitType,
      }));
      return;
    }

    if (name === 'demolitionPermitNumber3') {
      const applicationCategory = mapPermitTypeToApplication(value);
      setFormData((prev) => ({
        ...prev,
        demolitionPermitNumber3: value,
        ...(applicationCategory ? { applicationCategory } : {}),
      }));
      return;
    }

    if (DECIMAL_FIELDS.has(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number(value) : undefined,
      }));
      return;
    }

    if (INTEGER_FIELDS.has(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number.parseInt(value, 10) || undefined : undefined,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOwnerAddressSearch = () => {
    if (typeof window === 'undefined' || !window.daum?.Postcode) {
      return;
    }

    const postcode = new window.daum.Postcode({
      oncomplete: (data: DaumPostcodeData) => {
        const selectedAddress = data.roadAddress || data.address || data.jibunAddress || '';
        if (!selectedAddress) {
          return;
        }

        setFormData((prev) => ({
          ...prev,
          ownerAddress: selectedAddress,
        }));
      },
    });

    postcode.open();
  };

  useEffect(() => {
    if (editRequestId == null) {
      return;
    }

    let isMounted = true;
    const loadRequest = async () => {
      setIsLoadingRequest(true);
      try {
        const detail = await getDemolitionRequestById(editRequestId);
        if (
          detail.status !== 'INITIAL_REQUEST' &&
          detail.status !== 'INITIAL_REJECTED'
        ) {
          toast.error('초기 접수 또는 반려 상태에서만 수정할 수 있습니다.');
          router.replace(`/district/demolition/${editRequestId}`);
          return;
        }

        if (!isMounted) {
          return;
        }

        setFormData(mapDetailToFormData(detail));
      } catch (error) {
        console.error(error);
        toast.error('요청 정보를 불러오지 못했습니다.');
        router.replace('/district/demolition/status');
      } finally {
        if (isMounted) {
          setIsLoadingRequest(false);
        }
      }
    };

    void loadRequest();

    return () => {
      isMounted = false;
    };
  }, [editRequestId, router]);

  const handleSiteAddressSearch = () => {
    if (typeof window === 'undefined' || !window.daum?.Postcode) {
      return;
    }

    const postcode = new window.daum.Postcode({
      oncomplete: (data: DaumPostcodeData) => {
        const selectedAddress = data.roadAddress || data.address || data.jibunAddress || '';
        if (!selectedAddress) {
          return;
        }

        setFormData((prev) => ({
          ...prev,
          siteAddress: selectedAddress,
          siteDetailAddress: '',
        }));

        window.requestAnimationFrame(() => {
          const detailInput = document.querySelector<HTMLInputElement>('input[name="siteDetailAddress"]');
          detailInput?.focus();
        });
      },
    });

    postcode.open();
  };

  const fetchPriorityCandidates = async (
    page = 0,
    overrideTerm?: string,
  ) => {
    if (!formData.zone || !formData.demolitionScale) {
      setPriorityCandidatesError('권역과 해체공사 규모를 먼저 선택해주세요.');
      setPriorityCandidates([]);
      return;
    }

    const searchTerm = overrideTerm ?? prioritySearchTerm;
    const keyword = searchTerm.trim();

    // 키워드 없으면 검색하지 않음
    if (!keyword) {
      return;
    }

    setIsPriorityCandidatesLoading(true);
    try {
      const data = await searchPriorityDesignationCandidatesByArea({
        zone: formData.zone,
        scale: formData.demolitionScale,
        keyword,
        page,
        size: PRIORITY_CANDIDATE_PAGE_SIZE,
      });
      setPriorityCandidates(data.content ?? []);
      setPriorityCandidatePage(data.number ?? page);
      setPriorityCandidateTotalPages(data.totalPages ?? 0);
      setPriorityCandidatesError(null);
    } catch (error) {
      console.error(error);
      setPriorityCandidates([]);
      setPriorityCandidatePage(0);
      setPriorityCandidateTotalPages(0);
      setPriorityCandidatesError('우선지정 감리자 목록을 불러오지 못했습니다. 입력값과 권한을 확인해주세요.');
    } finally {
      setIsPriorityCandidatesLoading(false);
    }
  };

  const openPriorityModal = () => {
    if (!formData.zone || !formData.demolitionScale) {
      toast.error('권역과 해체공사 규모를 먼저 선택해주세요.');
      return;
    }

    setPrioritySearchTerm('');
    setPriorityCandidates([]);
    setPriorityCandidatePage(0);
    setPriorityCandidateTotalPages(0);
    setPriorityCandidatesError(null);
    setIsPriorityModalOpen(true);
  };

  const handlePriorityCandidateSelect = (candidate: PriorityDesignationApplicant) => {
    if (selectedPriorityCandidates.length >= MAX_PRIORITY_DESIGNATIONS) {
      toast.error(`최대 ${MAX_PRIORITY_DESIGNATIONS}명까지만 선택할 수 있습니다.`);
      return;
    }

    const supervisorName = candidate.fullName || candidate.applicantName || candidate.username || '';
    const applicantId = candidate.applicantId;
    const userId = candidate.userId;
    const supervisorLicense = candidate.licenseNumber;

    // 이미 선택된 감리자인지 확인
    const isDuplicate = selectedPriorityCandidates.some(
      (c) => (userId && c.userId === userId) || (applicantId && c.applicantId === applicantId)
    );
    if (isDuplicate) {
      toast.error('이미 선택된 감리자입니다.');
      return;
    }

    setSelectedPriorityCandidates((prev) => [
      ...prev,
      {
        applicantId,
        userId,
        supervisorName,
        supervisorBirthdate: undefined,
        supervisorLicense,
      },
    ]);

    // 첫 번째 감리자를 기존 필드에도 설정 (하위호환)
    if (selectedPriorityCandidates.length === 0) {
      setFormData((prev) => ({
        ...prev,
        priorityDesignation: true,
        prioritySupervisorName: supervisorName,
        supervisorId: userId ?? applicantId ?? prev.supervisorId,
      }));
    }

    toast.success(`${supervisorName}님을 ${selectedPriorityCandidates.length + 1}순위로 추가했습니다.`);
  };

  const clearPrioritySelection = () => {
    setSelectedPriorityCandidates([]);
    setFormData((prev) => ({
      ...prev,
      prioritySupervisorName: '',
      supervisorId: undefined,
    }));
  };

  const removePriorityCandidate = (index: number) => {
    setSelectedPriorityCandidates((prev) => {
      const newList = prev.filter((_, i) => i !== index);
      // 첫 번째 감리자가 변경되면 기존 필드도 업데이트
      if (newList.length > 0) {
        setFormData((f) => ({
          ...f,
          prioritySupervisorName: newList[0].supervisorName,
          supervisorId: newList[0].userId ?? newList[0].applicantId,
        }));
      } else {
        setFormData((f) => ({
          ...f,
          prioritySupervisorName: '',
          supervisorId: undefined,
        }));
      }
      return newList;
    });
  };

  const movePriorityCandidate = (index: number, direction: 'up' | 'down') => {
    setSelectedPriorityCandidates((prev) => {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newList = [...prev];
      [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];

      // 첫 번째 감리자가 변경되면 기존 필드도 업데이트
      setFormData((f) => ({
        ...f,
        prioritySupervisorName: newList[0].supervisorName,
        supervisorId: newList[0].userId ?? newList[0].applicantId,
      }));

      return newList;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.districtOffice ||
      !formData.region ||
      !formData.zone ||
      !formData.residentialArea ||
      !formData.officerName ||
      !formData.officerPhone ||
      !formData.officerEmail ||
      !formData.ownerName ||
      !formData.siteAddress ||
      !formData.applicationCategory ||
      !formData.structureType ||
      !formData.floorsAbove ||
      !formData.floorsBelow ||
      !formData.demolitionType ||
      !formData.demolitionScale ||
      formData.siteArea == null ||
      formData.buildingArea == null ||
      formData.totalFloorArea == null
    ) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (formData.priorityDesignation) {
      if (!formData.priorityReason) {
        toast.error('우선지정 사유를 선택해주세요.');
        return;
      }

      if (selectedPriorityCandidates.length === 0 && !formData.prioritySupervisorName) {
        toast.error('우선지정 감리자를 최소 1명 이상 선택해주세요.');
        return;
      }
    }

    // priorityDesignations 배열 생성
    const priorityDesignations: PriorityDesignationRequest[] = selectedPriorityCandidates.map(
      (candidate, index) => ({
        order: index + 1,
        applicantId: candidate.applicantId,
        userId: candidate.userId,
        supervisorName: candidate.supervisorName,
        supervisorBirthdate: candidate.supervisorBirthdate,
        supervisorLicense: candidate.supervisorLicense,
      })
    );

    const hasPriorityDesignations = priorityDesignations.length > 0;

    const submitData: DistrictDemolitionRequestCreate = {
      ...formData,
      // priorityDesignations 배열이 있으면 priorityDesignation도 true로 설정
      priorityDesignation: hasPriorityDesignations ? true : formData.priorityDesignation,
      priorityDesignations: hasPriorityDesignations ? priorityDesignations : undefined,
    };

    setIsSubmitting(true);
    try {
      if (isEditMode && editRequestId != null) {
        await updateDemolitionRequest(editRequestId, submitData);
        toast.success('해체감리 요청을 수정했습니다.');
        router.push(`/district/demolition/${editRequestId}`);
      } else {
        await createDemolitionRequest(submitData);
        toast.success('해체감리 요청이 등록되었습니다.');
        router.push('/district/demolition/status');
      }
    } catch (error) {
      console.error(error);
      toast.error(isEditMode ? '요청 수정에 실패했습니다.' : '요청 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="rounded-[24px] bg-gradient-to-r from-[#E3F4FF] via-[#DFEDFF] to-[#F4F7FB] px-8 py-10 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
        <h1 className="text-3xl font-semibold text-heading">
          {isEditMode ? '해체감리 요청 수정' : '해체감리 요청 등록'}
        </h1>
        <p className="mt-2 text-base text-secondary">
          {isEditMode
            ? '초기 접수 또는 반려된 해체감리 요청 정보를 수정합니다.'
            : '건축물 해체공사 감리자 지정을 요청합니다.'}
        </p>
      </div>

      {isEditMode && isLoadingRequest ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-[20px] border border-border-neutral bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <span className="text-secondary">요청 정보를 불러오는 중입니다...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="rounded-[20px] border border-border-neutral bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-heading">
              <span className="flex items-center gap-1">
                요청일자 <span className="text-red-500">*</span>
              </span>
              <Input
                type="date"
                name="requestDate"
                value={formData.requestDate}
                onChange={handleChange}
                required
                disabled
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-heading">
              <span className="flex items-center gap-1">
                요청 유형 <span className="text-red-500">*</span>
              </span>
              <Select
                name="requestType"
                value={formData.requestType}
                onChange={handleChange}
                required
              >
                <option value="RECOMMENDATION">추천</option>
                <option value="PRIORITY_DESIGNATION">우선지정</option>
              </Select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-heading">
              의뢰 구분
              <Input
                type="text"
                name="requestCategory"
                value={formData.requestCategory || ''}
                onChange={handleChange}
                placeholder="예: 일반"
                disabled
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-heading">
              <span className="flex items-center gap-1">
                지역/구 <span className="text-red-500">*</span>
              </span>
              <Input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="예: 강남구"
                required
                disabled
              />
            </label>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-heading">
                <span className="whitespace-nowrap">권역 <span style={{ color: '#FF0A73' }}>*</span></span>
              </label>
              <SelectCardGroup
                value={formData.zone}
                onChange={(value) => setFormData((prev) => ({ ...prev, zone: value as string }))}
                mode="single"
                gridCols={4}
                helperText={formData.zone ? APPLICANT_ZONE_OPTIONS.find(opt => opt.value === formData.zone)?.description : undefined}
                disabled
              >
                {APPLICANT_ZONE_OPTIONS.map((option) => (
                  <SelectCard key={option.value} value={option.value}>
                    {option.label}
                  </SelectCard>
                ))}
              </SelectCardGroup>
            </div>

          </div>
        </div>

        {/* 담당자 정보 */}
        <div className="rounded-[20px] border border-border-neutral bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <h2 className="text-xl font-semibold mb-4">담당자 정보</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-heading">
              <span className="flex items-center gap-1">
                구청명 <span className="text-red-500">*</span>
              </span>
              <Input
                type="text"
                name="districtOffice"
                value={formData.districtOffice}
                onChange={handleChange}
                placeholder="예: 강남구청"
                required
                disabled
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-heading">
              <span className="flex items-center gap-1">
                담당자명 <span className="text-red-500">*</span>
              </span>
              <Input
                type="text"
                name="officerName"
                value={formData.officerName}
                onChange={handleChange}
                placeholder="담당자 이름"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-heading">
              <span className="flex items-center gap-1">
                담당자 연락처 <span className="text-red-500">*</span>
              </span>
              <Input
                type="tel"
                name="officerPhone"
                value={formData.officerPhone}
                onChange={handleChange}
                placeholder="010-0000-0000"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-heading">
              담당자 팩스
              <Input
                type="text"
                name="officerFax"
                value={formData.officerFax}
                onChange={handleChange}
                placeholder="02-000-0000"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-heading">
              <span className="flex items-center gap-1">
                담당자 이메일 <span className="text-red-500">*</span>
              </span>
              <Input
                type="email"
                name="officerEmail"
                value={formData.officerEmail}
                onChange={handleChange}
                placeholder="email@example.com"
                required
              />
            </label>
          </div>
        </div>

        {/* 건축주 정보 */}
        <div className="rounded-[20px] border border-border-neutral bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <h2 className="text-xl font-semibold mb-4">건축주 정보</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                <span className="flex items-center gap-1">
                  건축주명 <span className="text-red-500">*</span>
                </span>
                <Input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="건축주 이름"
                  required
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                건축주 연락처
                <Input
                  type="tel"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                  placeholder="010-0000-0000"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-heading">
              건축주 주소
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="text"
                  name="ownerAddress"
                  value={formData.ownerAddress}
                  onChange={handleChange}
                  placeholder="건축주 주소"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleOwnerAddressSearch}
                  disabled={!isPostcodeReady}
                >
                  주소 검색
                </Button>
              </div>
            </label>
          </div>
        </div>

        {/* 건축물 정보 */}
        <div className="rounded-[20px] border border-border-neutral bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
          <h2 className="text-xl font-semibold mb-4">건축물 정보</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                <span className="flex items-center gap-1">
                  대지위치(주소) <span className="text-red-500">*</span>
                </span>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    type="text"
                    name="siteAddress"
                    value={formData.siteAddress}
                    onChange={handleChange}
                    placeholder="해체 현장 주소"
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleSiteAddressSearch}
                    disabled={!isPostcodeReady}
                  >
                    주소 검색
                  </Button>
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                상세 주소
                <Input
                  type="text"
                  name="siteDetailAddress"
                  value={formData.siteDetailAddress}
                  onChange={handleChange}
                  placeholder="해체 현장 상세 주소"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-heading">
              <span className="flex items-center gap-1">
                주거지역 <span className="text-red-500">*</span>
              </span>
              <Select
                name="residentialArea"
                value={formData.residentialArea}
                onChange={handleChange}
                required
              >
                <option value="">선택하세요</option>
                {RESIDENTIAL_AREA_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </label>

            <div className="flex flex-col gap-2 text-sm font-medium text-heading">
              <span className="flex items-center gap-1">
                신청 구분 <span className="text-red-500">*</span>
              </span>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6 text-[15px] font-normal">
                {APPLICATION_CATEGORY_OPTIONS.map((option) => (
                  <label key={option} className="inline-flex items-center gap-2 text-heading">
                    <input
                      type="radio"
                      name="applicationCategory"
                      value={option}
                      checked={formData.applicationCategory === option}
                      onChange={handleChange}
                      className="h-4 w-4 rounded-full border border-border-light"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                용도
                <Select
                  name="buildingUse"
                  value={formData.buildingUse}
                  onChange={handleChange}
                >
                  <option value="">선택하세요</option>
                  {BUILDING_USE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                <span className="flex items-center gap-1">
                  구조 형식 <span className="text-red-500">*</span>
                </span>
                <Select
                  name="structureType"
                  value={formData.structureType}
                  onChange={handleChange}
                >
                  <option value="">선택하세요</option>
                  {STRUCTURE_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                <span className="flex items-center gap-1">
                  지상층수 <span className="text-red-500">*</span>
                </span>
                <Input
                  type="text"
                  name="floorsAbove"
                  value={formData.floorsAbove || ''}
                  onChange={handleChange}
                  placeholder="예: 5"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                <span className="flex items-center gap-1">
                  지하층수 <span className="text-red-500">*</span>
                </span>
                <Input
                  type="text"
                  name="floorsBelow"
                  value={formData.floorsBelow || ''}
                  onChange={handleChange}
                  placeholder="예: 1"
                />
              </label>

              <div className="flex flex-col gap-2 text-sm font-medium text-heading">
                <span className="flex items-center gap-1">
                  해체공사 유형 <span className="text-red-500">*</span>
                </span>
                <div className="flex flex-col gap-2 text-[15px] font-normal sm:flex-row sm:flex-wrap sm:gap-4">
                  {DEMOLITION_TYPE_OPTIONS.map((option) => (
                    <label key={option} className="inline-flex items-center gap-2 text-heading">
                      <input
                        type="radio"
                        name="demolitionType"
                        value={option}
                        checked={formData.demolitionType === option}
                        onChange={handleChange}
                        className="h-4 w-4 rounded-full border border-border-light"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 text-sm font-medium text-heading">
                <span className="flex items-center gap-1">
                  해체공사 규모 <span className="text-red-500">*</span>
                </span>
                <div className="flex flex-col gap-2 text-[15px] font-normal sm:flex-row sm:flex-wrap sm:gap-4">
                  {APPLICANT_GRADE_LEVEL_OPTIONS.map((option) => (
                    <label key={option.value} className="inline-flex items-center gap-2 text-heading">
                      <input
                        type="radio"
                        name="demolitionScale"
                        value={option.value}
                        checked={formData.demolitionScale === option.value}
                        onChange={handleChange}
                        className="h-4 w-4 rounded-full border border-border-light"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                <span className="flex items-center gap-1">
                  대지면적 (㎡) <span className="text-red-500">*</span>
                </span>
                <Input
                  type="number"
                  step="0.01"
                  name="siteArea"
                  value={formData.siteArea ?? ''}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                <span className="flex items-center gap-1">
                  건축면적 (㎡) <span className="text-red-500">*</span>
                </span>
                <Input
                  type="number"
                  step="0.01"
                  name="buildingArea"
                  value={formData.buildingArea ?? ''}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                <span className="flex items-center gap-1">
                  연면적 (㎡) <span className="text-red-500">*</span>
                </span>
                <Input
                  type="number"
                  step="0.01"
                  name="totalFloorArea"
                  value={formData.totalFloorArea ?? ''}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </label>
            </div>

            <div className="flex flex-col gap-2 text-sm font-medium text-heading">
              해체 허가(신고) 번호
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  type="text"
                  name="demolitionPermitNumber1"
                  value={formData.demolitionPermitNumber1}
                  onChange={handleChange}
                  placeholder="2025"
                  aria-label="해체 허가(신고) 번호 1"
                />
                <Input
                  type="text"
                  name="demolitionPermitNumber2"
                  value={formData.demolitionPermitNumber2}
                  onChange={handleChange}
                  placeholder="건축과"
                  aria-label="해체 허가(신고) 번호 2"
                />
                <Select
                  name="demolitionPermitNumber3"
                  value={formData.demolitionPermitNumber3}
                  onChange={handleChange}
                  aria-label="해체 허가(신고) 번호 3"
                >
                  <option value="">선택하세요</option>
                  {DEMOLITION_PERMIT_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
                <Input
                  type="text"
                  name="demolitionPermitNumber4"
                  value={formData.demolitionPermitNumber4}
                  onChange={handleChange}
                  placeholder=" "
                  aria-label="해체 허가(신고) 번호 4"
                />
              </div>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-heading">
              해체 허가(신고) 일자
              <Input
                type="date"
                name="demolitionPermitDate"
                value={formData.demolitionPermitDate || ''}
                onChange={handleChange}
              />
            </label>
          </div>
        </div>

        {/* 우선지정 (조건부 표시) */}
        {(formData.requestType === 'PRIORITY_DESIGNATION' || formData.priorityDesignation) && (
          <div className="rounded-[20px] border border-border-neutral bg-white px-8 py-6 shadow-[2px_4px_20px_rgba(0,0,0,0.05)]">
            <h2 className="text-xl font-semibold mb-4">우선지정 정보</h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="priorityDesignation"
                  checked={formData.priorityDesignation}
                  onChange={handleChange}
                  className="rounded border-gray-300"
                  disabled={formData.requestType === 'PRIORITY_DESIGNATION'}
                />
                <span className="text-sm font-medium text-heading">우선지정 여부</span>
              </label>

              {formData.priorityDesignation && (
                <>
                  <label className="flex flex-col gap-2 text-sm font-medium text-heading">
                    우선지정 사유 <span className="text-red-500">*</span>
                    <Select
                      name="priorityReason"
                      value={formData.priorityReason}
                      onChange={handleChange}
                      required={formData.priorityDesignation}
                    >
                      <option value="">선택하세요</option>
                      {PRIORITY_DESIGNATION_REASON_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </label>

                  <div className="flex flex-col gap-2 text-sm font-medium text-heading">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        우선지정 감리자 (최대 {MAX_PRIORITY_DESIGNATIONS}명) <span className="text-red-500">*</span>
                        <span className="ml-2 text-xs font-normal text-secondary">
                          ({selectedPriorityCandidates.length}/{MAX_PRIORITY_DESIGNATIONS}명 선택됨)
                        </span>
                      </span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            void openPriorityModal();
                          }}
                          disabled={selectedPriorityCandidates.length >= MAX_PRIORITY_DESIGNATIONS}
                        >
                          감리자 검색
                        </Button>
                        {selectedPriorityCandidates.length > 0 && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={clearPrioritySelection}
                          >
                            전체 해제
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 선택된 감리자 목록 */}
                    {selectedPriorityCandidates.length > 0 ? (
                      <div className="mt-2 rounded-lg border border-border-light">
                        {selectedPriorityCandidates.map((candidate, index) => (
                          <div
                            key={`${candidate.userId ?? candidate.applicantId ?? index}`}
                            className="flex items-center justify-between gap-4 border-b border-border-light px-4 py-3 last:border-none"
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                                {index + 1}
                              </span>
                              <span className="font-medium">{candidate.supervisorName}</span>
                              {(candidate.userId || candidate.applicantId) && (
                                <span className="text-xs text-secondary">
                                  (ID: {candidate.userId ?? candidate.applicantId})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => movePriorityCandidate(index, 'up')}
                                disabled={index === 0}
                                className="px-2"
                              >
                                ↑
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => movePriorityCandidate(index, 'down')}
                                disabled={index === selectedPriorityCandidates.length - 1}
                                className="px-2"
                              >
                                ↓
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => removePriorityCandidate(index)}
                                className="px-2 text-red-500 hover:text-red-600"
                              >
                                ✕
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-secondary">
                        감리자 검색 버튼을 눌러 우선지정 감리자를 선택해주세요.
                      </p>
                    )}
                  </div>

                  {/* 수동 입력 (기존 호환용, 검색 미사용 시) */}
                  {selectedPriorityCandidates.length === 0 && (
                    <div className="flex flex-col gap-2 text-sm font-medium text-heading">
                      <span className="text-secondary">또는 직접 입력:</span>
                      <Input
                        type="text"
                        name="prioritySupervisorName"
                        value={formData.prioritySupervisorName}
                        onChange={handleChange}
                        placeholder="우선지정할 감리자 이름 (직접 입력)"
                      />
                      <Input
                        type="number"
                        name="supervisorId"
                        value={formData.supervisorId ?? ''}
                        onChange={handleChange}
                        placeholder="감리자 ID (직접 입력)"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              router.push(
                isEditMode && editRequestId != null
                  ? `/district/demolition/${editRequestId}`
                  : '/district/demolition/status',
              )
            }
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting || (isEditMode && isLoadingRequest)}>
            {isSubmitting
              ? isEditMode
                ? '수정 중...'
                : '등록 중...'
              : isEditMode
                ? '요청 수정'
                : '요청 등록'}
          </Button>
        </div>
      </form>
      )}

      {isPriorityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-3xl rounded-[24px] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-heading">우선지정 감리자 검색</h3>
                <p className="mt-1 text-sm text-secondary">
                  권역: {formData.zone} · 규모: {formData.demolitionScale}
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsPriorityModalOpen(false)}>
                닫기
              </Button>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                type="text"
                value={prioritySearchTerm}
                onChange={(event) => setPrioritySearchTerm(event.target.value)}
                placeholder="감리자 이름 또는 자격번호 검색"
                className="flex-1"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void fetchPriorityCandidates(0);
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => void fetchPriorityCandidates(0)}
                  disabled={isPriorityCandidatesLoading}
                >
                  검색
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setPrioritySearchTerm('');
                    void fetchPriorityCandidates(0, '');
                  }}
                  disabled={isPriorityCandidatesLoading}
                >
                  초기화
                </Button>
              </div>
            </div>

            {priorityCandidatesError && (
              <p className="mt-3 text-sm text-red-600">{priorityCandidatesError}</p>
            )}

            <div className="mt-4 max-h-[360px] overflow-y-auto rounded-[16px] border border-border-light">
              {isPriorityCandidatesLoading ? (
                <div className="p-6 text-center text-secondary">불러오는 중...</div>
              ) : priorityCandidates.length === 0 ? (
                <div className="p-6 text-center text-secondary">검색 결과가 없습니다.</div>
              ) : (
                priorityCandidates.map((candidate, index) => {
                  const key =
                    candidate.userId?.toString() ??
                    candidate.applicantId?.toString() ??
                    candidate.username ??
                    candidate.fullName ??
                    `candidate-${index}`;
                  const zoneLabel = candidate.zone || candidate.region || null;
                  const gradeLabel = candidate.supervisorType
                    ? GRADE_LEVEL_LABEL_MAP[candidate.supervisorType] ?? candidate.supervisorType
                    : null;
                  // 동명이인 구별을 위한 추가 정보
                  const infoParts = [
                    candidate.licenseNumber ? `자격번호: ${candidate.licenseNumber}` : null,
                    candidate.mobilePhone ? `연락처: ${candidate.mobilePhone}` : null,
                    zoneLabel,
                    gradeLabel ? `등급 ${gradeLabel}` : null,
                    candidate.specialty || null,
                    candidate.supervisionCount != null ? `수행 ${candidate.supervisionCount}건` : null,
                  ].filter(Boolean);
                  // 이미 선택된 감리자인지 확인
                  const isAlreadySelected = selectedPriorityCandidates.some(
                    (c) => (candidate.userId && c.userId === candidate.userId) ||
                           (candidate.applicantId && c.applicantId === candidate.applicantId)
                  );
                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between gap-4 border-b border-border-light px-4 py-3 last:border-none ${isAlreadySelected ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-heading">
                            {candidate.fullName || candidate.applicantName || candidate.username || '이름 미상'}
                          </p>
                          {isAlreadySelected && (
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">선택됨</span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-secondary">{infoParts.join(' · ')}</p>
                        {candidate.officeAddress && (
                          <p className="mt-0.5 text-xs text-secondary truncate">📍 {candidate.officeAddress}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handlePriorityCandidateSelect(candidate)}
                        disabled={isAlreadySelected}
                        variant={isAlreadySelected ? 'secondary' : 'primary'}
                      >
                        {isAlreadySelected ? '선택됨' : '선택'}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>

            {priorityCandidateTotalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={priorityCandidatePage <= 0 || isPriorityCandidatesLoading}
                  onClick={() => void fetchPriorityCandidates(priorityCandidatePage - 1)}
                >
                  이전
                </Button>
                <span className="text-secondary">
                  {priorityCandidatePage + 1} / {priorityCandidateTotalPages}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={priorityCandidatePage >= priorityCandidateTotalPages - 1 || isPriorityCandidatesLoading}
                  onClick={() => void fetchPriorityCandidates(priorityCandidatePage + 1)}
                >
                  다음
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
