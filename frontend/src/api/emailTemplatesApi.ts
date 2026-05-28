import { axiosClient } from "./axiosClient";
import type {
    CreateEmailTemplateRequest,
    EmailTemplate,
    PreviewEmailTemplateResponse,
} from "../types/emailTemplate";

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
    const response = await axiosClient.get<EmailTemplate[]>("/api/email-templates");
    return response.data;
}

export async function createEmailTemplate(request: CreateEmailTemplateRequest
): Promise<EmailTemplate> {
    const response = await axiosClient.post<EmailTemplate>
        ("/api/email-templates", request);

    return response.data;
}

export async function deleteEmailTemplate(id: string): Promise<void> {
    await axiosClient.delete(`/api/email-templates/${id}`);
}

export async function previewEmailTemplate(
    templateId: string,
    jobApplicationId: string
): Promise<PreviewEmailTemplateResponse> {
    const response = await axiosClient.get<PreviewEmailTemplateResponse>(
        `/api/email-templates/${templateId}/preview/${jobApplicationId}`
    );

    return response.data;
}
