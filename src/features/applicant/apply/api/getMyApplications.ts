import { getMyApplicants } from "@/entities/applicant/api";
import type { ApplicantDetail } from "@/entities/applicant/model/types";

export async function getMyApplications(): Promise<ApplicantDetail[]> {
  return getMyApplicants();
}
