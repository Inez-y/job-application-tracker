import { axiosClient } from "./axiosClient";
import type {
  CreateJobApplicationRequest,
  JobApplication,
  PagedResponse,
  UpdateJobApplicationRequest,
} from "../types/jobApplication";

export async function getJobApplications(): Promise<PagedResponse<JobApplication>> {
    const response = await axiosClient.get<PagedResponse<JobApplication>>(
        "/api/job-applications?page=1&pageSize=10"
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
