import { env } from "@/shared/config/env";

import type {
  Recruitment,
  RecruitmentAttachment,
  RecruitmentAttachmentDto,
  RecruitmentDto,
  RecruitmentListResponse,
  RecruitmentPageRaw,
} from "./types";

function resolveAttachmentUrl(id: number, attachmentPath?: string) {
  if (!attachmentPath) return undefined;
  return `${env.apiBaseUrl}/api/recruitments/${id}/attachment`;
}

function mapRecruitmentAttachment(attachment: RecruitmentAttachmentDto, fallbackUrl?: string): RecruitmentAttachment {
  return {
    id: attachment.id,
    fileName: attachment.fileName,
    url: attachment.url ?? fallbackUrl,
  };
}

function mapRecruitmentAttachmentList(
  attachments?: RecruitmentAttachmentDto[] | null,
  fallbackUrl?: string,
): RecruitmentAttachment[] {
  if (!Array.isArray(attachments)) {
    return [];
  }

  return attachments.map((attachment) => mapRecruitmentAttachment(attachment, fallbackUrl));
}

export function mapRecruitmentDto(dto: RecruitmentDto): Recruitment {
  const fallbackAttachmentUrl = resolveAttachmentUrl(dto.id, dto.attachmentPath);
  const attachments = mapRecruitmentAttachmentList(dto.attachments, fallbackAttachmentUrl);
  const primaryAttachment = attachments[0];

  return {
    id: dto.id,
    periodNumber: dto.periodNumber,
    title: dto.title,
    content: dto.content,
    startDate: dto.startDate,
    endDate: dto.endDate,
    executionStartDate: dto.executionStartDate,
    executionEndDate: dto.executionEndDate,
    status: dto.status,
    statusDescription: dto.statusDescription,
    attachmentName: primaryAttachment?.fileName ?? dto.attachmentName ?? undefined,
    attachmentPath: dto.attachmentPath ?? undefined,
    attachmentUrl: primaryAttachment?.url ?? fallbackAttachmentUrl,
    attachments,
    createdById: dto.createdById,
    createdByUsername: dto.createdByUsername,
    createdByRole: dto.createdByRole,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    isActive: dto.isActive ?? dto.active ?? undefined,
    applicantCount: dto.applicantCount,
  };
}

export function mapRecruitmentDtoList(list: RecruitmentDto[] | undefined | null): Recruitment[] {
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map(mapRecruitmentDto);
}

function extractPagePayload(raw: RecruitmentPageRaw | { data?: RecruitmentPageRaw } | unknown): RecruitmentPageRaw {
  if (raw && typeof raw === "object" && raw !== null) {
    if ("data" in raw && raw.data && typeof raw.data === "object") {
      return raw.data as RecruitmentPageRaw;
    }
    return raw as RecruitmentPageRaw;
  }
  return {};
}

function coerceNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function mapRecruitmentPageResponse(raw: unknown): RecruitmentListResponse {
  const payload = extractPagePayload(raw);
  const listSource = Array.isArray(payload.content)
    ? payload.content
    : Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload.records)
        ? payload.records
        : [];

  const content = mapRecruitmentDtoList(listSource);

  const size = coerceNumber(payload.size ?? payload.pageSize, content.length);
  const page = coerceNumber(payload.number ?? payload.page ?? payload.pageIndex, 0);
  const totalElements = coerceNumber(
    payload.totalElements ?? payload.totalCount ?? payload.count,
    content.length,
  );
  const totalPagesRaw = coerceNumber(payload.totalPages ?? payload.pages, 0);
  const totalPages = totalPagesRaw || (size > 0 ? Math.ceil(totalElements / size) : content.length > 0 ? 1 : 0);

  const first = typeof payload.first === "boolean" ? payload.first : undefined;
  const last = typeof payload.last === "boolean" ? payload.last : undefined;

  const hasNext = last != null ? !last : page < totalPages - 1;
  const hasPrevious = first != null ? !first : page > 0;

  return {
    content,
    number: page,
    size,
    totalPages,
    totalElements,
    hasNext,
    hasPrevious,
  };
}
