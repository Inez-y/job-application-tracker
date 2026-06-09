import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    getEmailTemplates,
    previewEmailTemplate,
} from "../../api/emailTemplatesApi";

type Props = { jobApplicationId: string; };

export function EmailTemplatePreviewSection({ jobApplicationId }: Props) {
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [copyMessage, setCopyMessage] = useState<string | null>(null);

    const {
        data: templates,
        isLoading: isTemplatesLoading,
        isError: isTemplatesError,
    } = useQuery({
        queryKey: ["emailTemplates"],
        queryFn: getEmailTemplates,
    });

    const {
        data: preview,
        isLoading: isPreviewLoading,
        isError: isPreviewError,
    } = useQuery({
        queryKey: ["emailTemplatePreview", selectedTemplateId, jobApplicationId],
        queryFn: () => previewEmailTemplate(selectedTemplateId, jobApplicationId),
        enabled: Boolean(selectedTemplateId),
    });

    async function handleCopyToClipboard() {
        if (!preview) {
            return;
        }

        try {
            await navigator.clipboard.writeText(
            `Subject: ${preview.subject}\n\n${preview.body}`
            );

            setCopyMessage("Template copied to clipboard.");
        } catch {
            setCopyMessage("Failed to copy template. Please try again.");
        }
    }

    return (
    <section className="">
        <h2 className="text-lg font-semibold text-slate-900">
            Email Template Preview
        </h2>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            {isTemplatesLoading && (
                <p className="text-slate-600"> Loading templates... </p>
            )}

            {isTemplatesError && (
                <p className="text-red-600"> Failed to load email templates. </p>
            )}

            {!isTemplatesLoading &&
            !isTemplatesError &&
            (!templates || templates.length === 0) && (
                <p className="text-slate-600">
                    No email templates yet. Create one from the Email Templates page.
                </p>
            )}

            {templates && templates.length > 0 && (
            <div>
                <label 
                htmlFor="emailTemplatePreviewSelect"
                className="block text-sm font-medium text-slate-700">
                    Choose Template
                </label>

                <select
                id="emailTemplatePreviewSelect"
                value={selectedTemplateId}
                onChange={(event) => {
                    setSelectedTemplateId(event.target.value);
                    setCopyMessage(null);
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                >
                <option value=""> Select a template </option>
                {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                    {template.name}
                    </option>
                ))}
                </select>
            </div>
            )}

            {isPreviewLoading && (
            <p className="mt-4 text-slate-600"> Generating preview... </p>
            )}

            {isPreviewError && (
            <p className="mt-4 text-red-600"> Failed to preview template. </p>
            )}

            {preview && (
            <div className="mt-4 rounded-lg bg-white p-4">
                <div>
                <p className="text-sm font-medium text-slate-500"> Subject </p>
                <p className="mt-1 font-semibold text-slate-900">
                    {preview.subject}
                </p>
                </div>

                <div className="mt-4">
                <p className="text-sm font-medium text-slate-500"> Body </p>
                <p className="mt-1 whitespace-pre-wrap text-slate-800">
                    {preview.body}
                </p>
                </div>

                <button
                type="button"
                onClick={handleCopyToClipboard}
                className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                    Copy to Clipboard
                </button>

                {copyMessage && (
                    <p
                        id="copyMessage"
                        className={`mt-2 text-sm ${
                        copyMessage.startsWith("Failed") ? "text-red-600" : "text-green-700"
                        }`}
                    >
                        {copyMessage}
                    </p>
                )}
            </div>
            )}
        </div>
    </section>
    );
}
