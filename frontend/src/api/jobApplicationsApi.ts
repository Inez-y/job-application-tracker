import { axiosClient } from "./axiosClient";
import type {
  CreateJobApplicationRequest,
  JobApplication,
  PagedResponse,
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
