import { httpClient } from "@/shared/api/httpClient";

type RecruitmentFormValues = {
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  executionStartDate: string;
  executionEndDate: string;
  attachment: File | null;
};

export async function updateRecruitment(id: number, form: RecruitmentFormValues) {
  const formData = new FormData();

  // API 스펙에 따라 JSON 데이터를 payload 파트로 전달
  const payload = {
    title: form.title,
    content: form.content,
    startDate: form.startDate,
    endDate: form.endDate,
    executionStartDate: form.executionStartDate,
    executionEndDate: form.executionEndDate,
  };

  formData.append("payload", new Blob([JSON.stringify(payload)], { type: "application/json" }));

  // 새로 추가할 첨부파일이 있으면 attachments 배열로 전달
  if (form.attachment) {
    formData.append("attachments", form.attachment);
  }

  const response = await httpClient.put(`/api/recruitments/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
