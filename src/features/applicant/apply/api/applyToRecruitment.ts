import { createApplicant } from "@/entities/applicant/api";
import type {
  ApplicantAttachmentUploads,
  ApplicantCreatePayload,
  ApplicantDetail,
} from "@/entities/applicant/model/types";

export interface ApplyToRecruitmentParams {
  payload: ApplicantCreatePayload;
  attachments: ApplicantAttachmentUploads;
}

export async function applyToRecruitment(
  params: ApplyToRecruitmentParams,
): Promise<ApplicantDetail> {
  const { payload, attachments } = params;
  return createApplicant(payload, attachments);
}
