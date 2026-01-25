import { resubmitApplicant } from "@/entities/applicant/api";
import type {
  ApplicantAttachmentUploads,
  ApplicantDetail,
  ApplicantResubmitPayload,
} from "@/entities/applicant/model/types";

export interface ResubmitApplicationParams {
  payload: ApplicantResubmitPayload;
  attachments?: ApplicantAttachmentUploads;
}

export async function resubmitApplication(
  id: number,
  params: ResubmitApplicationParams,
): Promise<ApplicantDetail> {
  const { payload, attachments } = params;
  return resubmitApplicant(id, payload, attachments);
}
