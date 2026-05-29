import { axiosClient } from "./axiosClient";
import type { CreateInterviewRequest, Interview } from "../types/interview";

export async function getInterviews(jobApplicationId: string
): Promise<Interview[]> {
  const response = await axiosClient.get<Interview[]>(
    `/api/job-applications/${jobApplicationId}/interviews`
  );

  return response.data;
}

export async function createInterview(jobApplicationId: string, request: CreateInterviewRequest
): Promise<Interview> {
  const response = await axiosClient.post<Interview>(
    `/api/job-applications/${jobApplicationId}/interviews`,
    request
  );

  return response.data;
}

export async function deleteInterview(jobApplicationId: string, interviewId: string
): Promise<void> {
  await axiosClient.delete(
    `/api/job-applications/${jobApplicationId}/interviews/${interviewId}`
  );
}
