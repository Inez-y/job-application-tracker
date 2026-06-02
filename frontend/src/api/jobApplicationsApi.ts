import { axiosClient } from "./axiosClient";
import type {
  ApplicationStatus,
  ApplicationStatusHistory,
  CreateJobApplicationRequest,
  JobApplication,
  PagedResponse,
  UpdateJobApplicationRequest,
} from "../types/jobApplication";

export type GetJobApplicationsParams = {
    search?: string;
    status?: number | "";
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    page?: number;
    pageSize?: number;
};

export async function getJobApplications(params: GetJobApplicationsParams = {}
): Promise<PagedResponse<JobApplication>> {
    const response = await axiosClient.get<PagedResponse<JobApplication>>(
        "/api/job-applications",
        {
            params: {
                search: params.search || undefined,
                status: params.status === "" ? undefined : params.status,
                sortBy: params.sortBy ?? "createdAt",
                sortDirection: params.sortDirection ?? "desc",
                page: params.page ?? 1,
                pageSize: params.pageSize ?? 10,
            },
        }
    );

    return response.data;
}

export async function createJobApplication(
    request: CreateJobApplicationRequest
): Promise<JobApplication> {
    const response = await axiosClient.post<JobApplication>(
        "/api/job-applications",
        request
    );

    return response.data;
}

export async function getJobApplicationById(id: string): Promise<JobApplication> {
    const response = await axiosClient.get<JobApplication>(
        `/api/job-applications/${id}`
    );

    return response.data;
}

export async function updateJobApplication(
    id: string, 
    request: UpdateJobApplicationRequest
): Promise<JobApplication> {
    const response = await axiosClient.put<JobApplication>(
        `api/job-applications/${id}`,
        request
    );

    return response.data;
}

export async function deleteJobApplication(id: string): Promise<void> {
    await axiosClient.delete(`api/job-applications/${id}`);
}

export async function getStatusHistory(jobApplicationId: string): Promise<ApplicationStatusHistory[]> {
    const response = await axiosClient.get<ApplicationStatusHistory[]>(
        `/api/job-applications/${jobApplicationId}/status-history`
    );
    
    return response.data;
}

export type UpdateStatusHistoryRequest = {
  oldStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  changedAt: string;
};

export async function updateStatusHistory(
  jobApplicationId: string,
  historyId: string,
  request: UpdateStatusHistoryRequest
): Promise<void> {
  await axiosClient.put(
    `/api/job-applications/${jobApplicationId}/status-history/${historyId}`,
    request
  );
}

export async function deleteStatusHistory(
  jobApplicationId: string,
  historyId: string
): Promise<void> {
  await axiosClient.delete(
    `/api/job-applications/${jobApplicationId}/status-history/${historyId}`
  );
}