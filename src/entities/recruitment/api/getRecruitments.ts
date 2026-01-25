import { httpClient } from "@/shared/api/httpClient";

import { mapRecruitmentDtoList, mapRecruitmentPageResponse } from "../model/mapper";
import type {
  Recruitment,
  RecruitmentDto,
  RecruitmentListParams,
  RecruitmentListResponse,
  RecruitmentPageRaw,
} from "../model/types";

export async function getRecruitments(
  params: RecruitmentListParams = {},
): Promise<RecruitmentListResponse> {
  const response = await httpClient.get<RecruitmentPageRaw | { data?: RecruitmentPageRaw }>("/api/recruitments", {
    params,
  });

  return mapRecruitmentPageResponse(response.data);
}

export async function getActiveRecruitments(): Promise<Recruitment[]> {
  const response = await httpClient.get<RecruitmentDto[]>("/api/recruitments/active");
  return mapRecruitmentDtoList(response.data);
}
