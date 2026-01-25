import type { ApplicantDetail } from '@/entities/applicant/model/types';
import { getApplicantById as getApplicantDetail } from '@/entities/applicant/api';

export async function getApplicantById(id: number): Promise<ApplicantDetail> {
  return getApplicantDetail(id);
}
