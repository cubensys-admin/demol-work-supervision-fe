import { httpClient } from "@/shared/api/httpClient";

import { decodeProblemFields } from "../model/problemFields";
import type {
  ApplicantAttachmentUploads,
  ApplicantCreatePayload,
  ApplicantDetail,
  ApplicantListResponse,
  ApplicantProblemField,
  ApplicantResubmitPayload,
  ApplicantSubmissionSnapshot,
  ApplicantSummary,
  ApplicantUpdatePayload,
  ApplicantGender,
  SupervisorChangeResponse,
  ZoneChangeRequest,
} from "../model/types";

type RawApplicant = Omit<
  ApplicantDetail,
  | "problemFields"
  | "appliedScales"
  | "personnel"
  | "attachments"
  | "previousSubmission"
  | "zoneChangeRequest"
> & {
  problemFields?: ApplicantProblemField[] | string | null;
  appliedScales?: ApplicantDetail["appliedScales"] | null;
  personnel?: ApplicantDetail["personnel"] | null;
  attachments?: ApplicantDetail["attachments"] | null;
  previousSubmission?: ApplicantSubmissionSnapshot | null;
  zoneChangeRequest?: ZoneChangeRequest | null;
  appliedAt?: string | null;
  createdAt?: string | null;
  modifiedAt?: string | null;
};

function normalizeZoneChangeRequest(
  raw: RawApplicant["zoneChangeRequest"],
): ZoneChangeRequest | undefined {
  if (!raw) return undefined;
  const attachments = (raw.attachments ?? []).filter(Boolean);
  return {
    id: raw.id ?? undefined,
    zone: raw.zone ?? undefined,
    description: raw.description ?? undefined,
    createdAt: raw.createdAt ?? undefined,
    updatedAt: raw.updatedAt ?? undefined,
    attachments: attachments as ZoneChangeRequest["attachments"],
  };
}

function normalizeApplicant(raw: RawApplicant): ApplicantDetail {
  const problemFields = decodeProblemFields(raw.problemFields ?? null);
  const submittedAt = raw.submittedAt ?? raw.appliedAt ?? raw.createdAt ?? undefined;
  const appliedAt = raw.appliedAt ?? submittedAt;
  const updatedAt = raw.updatedAt ?? raw.modifiedAt ?? undefined;

  return {
    ...raw,
    appliedScales: raw.appliedScales ?? [],
    personnel: raw.personnel ?? [],
    attachments: raw.attachments ?? [],
    previousSubmission: raw.previousSubmission ?? undefined,
    zoneChangeRequest: normalizeZoneChangeRequest(raw.zoneChangeRequest),
    problemFields,
    submittedAt,
    appliedAt,
    updatedAt,
  } as ApplicantDetail;
}

function normalizeSummaryList(content: ApplicantSummary[]): ApplicantSummary[] {
  return content.map((item) => normalizeApplicant(item as RawApplicant));
}

function sanitizePayload<T extends Record<string, unknown>>(payload: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      result[key] = value;
      return;
    }
    if (value !== null) {
      result[key] = value;
      return;
    }
    result[key] = null;
  });
  return result;
}

function buildFormData(
  payload: ApplicantCreatePayload | ApplicantUpdatePayload,
  attachments?: ApplicantAttachmentUploads,
): FormData {
  const formData = new FormData();
  const sanitized = sanitizePayload(payload as Record<string, unknown>);
  const payloadBlob = new Blob([JSON.stringify(sanitized)], {
    type: "application/json",
  });
  formData.append("payload", payloadBlob);

  if (attachments) {
    Object.entries(attachments).forEach(([key, file]) => {
      if (file == null) return;

      if (Array.isArray(file)) {
        file.forEach((item) => {
          if (!item) return;
          formData.append(key, item);
        });
        return;
      }

      formData.append(key, file);
    });
  }

  return formData;
}

export async function createApplicant(
  payload: ApplicantCreatePayload,
  attachments: ApplicantAttachmentUploads = {},
) {
  const formData = buildFormData(payload, attachments);
  const response = await httpClient.post<ApplicantDetail>("/api/applicants", formData);
  return normalizeApplicant(response.data as RawApplicant);
}

export async function getMyApplicants() {
  const response = await httpClient.get<ApplicantDetail[]>("/api/applicants/me");
  return response.data.map((item) => normalizeApplicant(item as RawApplicant));
}

export async function getApplicantById(id: number) {
  const response = await httpClient.get<ApplicantDetail>(
    `/api/applicants/${id}`,
  );
  return normalizeApplicant(response.data as RawApplicant);
}

export async function updateApplicant(
  id: number,
  payload: ApplicantUpdatePayload,
  attachments?: ApplicantAttachmentUploads,
) {
  const formData = buildFormData(payload, attachments);
  const response = await httpClient.put<ApplicantDetail>(
    `/api/applicants/${id}`,
    formData,
  );
  return normalizeApplicant(response.data as RawApplicant);
}

export async function deleteApplicant(id: number) {
  await httpClient.delete(`/api/applicants/${id}`);
}

export async function resubmitApplicant(
  id: number,
  payload: ApplicantResubmitPayload,
  attachments?: ApplicantAttachmentUploads,
) {
  const formData = buildFormData(payload, attachments);
  const response = await httpClient.post<ApplicantDetail>(
    `/api/applicants/${id}/resubmit`,
    formData,
  );
  return normalizeApplicant(response.data as RawApplicant);
}

export async function submitPersonnelChange(
  applicantId: number,
  payload: {
    removePersonnelIds?: string[];
    addPersonnel: {
      name: string;
      birthDate: string;
      gender: ApplicantGender;
      qualification: string;
      identifier?: string;
    }[];
    reason?: string;
  },
  attachments: File[] = [],
) {
  const formData = new FormData();
  const sanitizedPayload = {
    removePersonnelIds: payload.removePersonnelIds ?? [],
    addPersonnel: payload.addPersonnel,
    reason: payload.reason ?? undefined,
  };
  formData.append(
    'payload',
    new Blob([JSON.stringify(sanitizedPayload)], { type: 'application/json' }),
  );

  attachments.forEach((file) => {
    formData.append('attachments', file);
  });

  const response = await httpClient.post<SupervisorChangeResponse>(
    `/api/applicants/${applicantId}/changes/personnel`,
    formData,
  );
  return response.data;
}

export async function getApplicantsByPeriod(
  periodNumber: number,
  page = 0,
  size = 10,
  filters?: {
    status?: string;
    zone?: string;
    name?: string;
    from?: string;
    to?: string;
  },
) {
  const response = await httpClient.get<ApplicantListResponse>(
    `/api/applicants/period/${periodNumber}`,
    {
      params: {
        page,
        size,
        ...filters,
      },
    },
  );
  const data = response.data;
  return {
    ...data,
    number: data.number ?? page,
    content: normalizeSummaryList(data.content),
  };
}

export async function startApplicantReview(id: number) {
  const response = await httpClient.put(`/api/applicants/${id}/review`);
  return normalizeApplicant(response.data as RawApplicant);
}

export async function approveApplicant(id: number) {
  const response = await httpClient.put(`/api/applicants/${id}/approve`);
  return normalizeApplicant(response.data as RawApplicant);
}

export async function rejectApplicant(id: number) {
  const response = await httpClient.put(`/api/applicants/${id}/reject`);
  return normalizeApplicant(response.data as RawApplicant);
}

export async function returnApplicant(
  id: number,
  payload: { returnReason: string; problemFields: ApplicantProblemField[] },
) {
  const response = await httpClient.post(`/api/applicants/${id}/return`, payload);
  return normalizeApplicant(response.data as RawApplicant);
}
