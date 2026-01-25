import { httpClient } from "@/shared/api/httpClient";

import { mapRecruitmentDto } from "../model/mapper";
import type { Recruitment, RecruitmentDto } from "../model/types";

export async function getRecruitmentByPeriod(
  periodNumber: number
): Promise<Recruitment> {
  const response = await httpClient.get<RecruitmentDto>(
    `/api/recruitments/period/${periodNumber}`
  );
  return mapRecruitmentDto(response.data);
}