import { httpClient } from "@/shared/api/httpClient";

export async function deleteRecruitment(id: number) {
  await httpClient.delete(`/api/recruitments/${id}`);
}
