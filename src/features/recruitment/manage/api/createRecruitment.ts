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

export async function createRecruitment(form: RecruitmentFormValues) {
  const formData = new FormData();
  formData.append("title", form.title);
  formData.append("content", form.content);
  formData.append("startDate", form.startDate);
  formData.append("endDate", form.endDate);
  formData.append("executionStartDate", form.executionStartDate);
  formData.append("executionEndDate", form.executionEndDate);
  if (form.attachment) {
    formData.append("attachment", form.attachment);
  }

  const response = await httpClient.post("/api/recruitments", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
