import { axiosClient } from "./axiosClient";
import type {
  ApplicationNote,
  CreateApplicationNoteRequest,
} from "../types/applicationNote";

export async function getApplicationNotes(jobApplicationId: string): Promise<ApplicationNote[]> {
  const response = await axiosClient.get<ApplicationNote[]>(
    `/api/job-applications/${jobApplicationId}/notes`
  );

  return response.data;
}

export async function createApplicationNote(jobApplicationId: string, request: CreateApplicationNoteRequest
): Promise<ApplicationNote> {
  const response = await axiosClient.post<ApplicationNote>(
    `/api/job-applications/${jobApplicationId}/notes`,
    request
  );

  return response.data;
}

export async function deleteApplicationNote(jobApplicationId: string, noteId: string
): Promise<void> {
  await axiosClient.delete(
    `/api/job-applications/${jobApplicationId}/notes/${noteId}`
  );
}
