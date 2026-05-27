import { axiosClient } from "./axiosClient";
import type { Document, DocumentType } from "../types/document";

export async function getDocuments(jobApplicationId: string): Promise<Document[]> {
    const response = await axiosClient.get<Document[]>(
        `/api/job-applications/${jobApplicationId}/documents`
    );

    return response.data;
}

export async function uploadDocument(jobApplicationId: string, file: File, type: DocumentType
): Promise<Document> {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("type", String(type));

    const response = await axiosClient.post<Document>(
        `/api/job-applications/${jobApplicationId}/documents`,
    formData,
    {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }
    );

    return response.data;
}

export async function downloadDocument(jobApplicationId: string, documentId: string): Promise<Blob> {
    const response = await axiosClient.get(
        `/api/job-applications/${jobApplicationId}/documents/${documentId}/download`,
        {
            responseType: "blob",
        }
    );

    return response.data;
}

export async function deleteDocument(jobApplicationId: string, documentId: string): Promise<void> {
  await axiosClient.delete(
    `/api/job-applications/${jobApplicationId}/documents/${documentId}`
  );
}
