import type { RecruitmentStatus } from "./types";

const STATUS_LABEL_MAP: Record<RecruitmentStatus, string> = {
  DRAFT: "임시저장",
  PUBLISHED: "게시됨",
  RECRUITING: "모집 중",
  CLOSED: "모집 종료",
};

export function getRecruitmentStatusLabel(status: RecruitmentStatus) {
  return STATUS_LABEL_MAP[status] ?? status;
}

const STATUS_STYLE_MAP: Record<RecruitmentStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PUBLISHED: "bg-primary/10 text-primary",
  RECRUITING: "bg-emerald-100 text-emerald-600",
  CLOSED: "bg-neutral-200 text-neutral-700",
};

export function getRecruitmentStatusBadge(status: RecruitmentStatus) {
  return STATUS_STYLE_MAP[status] ?? "bg-neutral-100 text-neutral-700";
}
