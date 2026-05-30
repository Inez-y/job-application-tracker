import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import type { EmailTemplateType } from "../types/emailTemplate";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import {
    createEmailTemplate,
    deleteEmailTemplate,
    getEmailTemplates,
    updateEmailTemplate,
} from "../api/emailTemplatesApi";

const templateTypeLabels: Record<number, string> = {
    0: "Follow Up",
    1: "Thank You",
    2: "Recruiter Outreach",
    3: "Interview Confirmation",
    4: "Withdrawal",
    5: "Other",
};

const placeholders = [
  { label: "Company Name", value: "{{CompanyName}}" },
  { label: "Job Title", value: "{{JobTitle}}" },
  { label: "Location", value: "{{Location}}" },
  { label: "Date Applied", value: "{{DateApplied}}" },
  { label: "Deadline", value: "{{Deadline}}" },
];

export function EmailTemplatesPage() {
    const queryClient = useQueryClient();

    const [name, setName] = useState("");
    const [type, setType] = useState<EmailTemplateType>(0);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [activeField, setActiveField] = useState<"subject" | "body">("body");
    const [templateIdToDelete, setTemplateIdToDelete] = useState<string | null>(null);
    const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["emailTemplates"],
        queryFn: getEmailTemplates,
    });

    const createMutation = useMutation({
        mutationFn: () =>
            createEmailTemplate({
                name,
                type,
                subject,
                body,
            }),
        onSuccess: () => {
            setName("");
            setType(0);
            setSubject("");
            setBody("");

            queryClient.invalidateQueries({
                queryKey: ["emailTemplates"],
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteEmailTemplate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
            queryKey: ["emailTemplates"],
            });
        },
    });

    function insertPlaceholder(value: string){
        if (activeField === "subject") {
            setSubject((current) => `${current}${value}`);
            return;
        }

        setBody((current) => `${current}${value}`);
    }

    const updateMutation = useMutation({
        mutationFn: () => {
            if (!editingTemplateId) {
            throw new Error("No template selected.");
            }

            return updateEmailTemplate(editingTemplateId, {
            name,
            type,
            subject,
            body,
            });
        },
        onSuccess: () => {
            setEditingTemplateId(null);
            setName("");
            setType(0);
            setSubject("");
            setBody("");

            queryClient.invalidateQueries({
            queryKey: ["emailTemplates"],
            });
        },
    });

    return (
    <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-6xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                Email Templates
                </h1>
                <p className="mt-2 text-slate-600">
                Create reusable follow-up, thank-you, and recruiter outreach templates.
                </p>
            </div>

            <Card> 
                <h2 className="text-lg font-semibold text-slate-900">
                    {editingTemplateId ? "Edit Template" : "Create Template"}
                </h2>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();

                        if (!name.trim() || !subject.trim() || !body.trim()) {
                            return;
                        }

                        if (editingTemplateId) {
                            updateMutation.mutate();
                        } else {
                            createMutation.mutate();
                        }
                    }}
                    className="mt-4 space-y-4"
                >
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                    <label 
                    htmlFor="templateName"
                    className="block text-sm font-medium text-slate-700">
                        Template Name
                    </label>
                    <input
                        id="templateName"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                        placeholder="Follow-up after application"
                    />
                    </div>

                    <div>
                    <label 
                    htmlFor="templateType"
                    className="block text-sm font-medium text-slate-700">
                        Type
                    </label>
                    <select
                        id="templateType"
                        value={type}
                        onChange={(event) =>
                        setType(Number(event.target.value) as EmailTemplateType)
                        }
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                    >
                        <option value={0}>Follow Up</option>
                        <option value={1}>Thank You</option>
                        <option value={2}>Recruiter Outreach</option>
                        <option value={3}>Interview Confirmation</option>
                        <option value={4}>Withdrawal</option>
                        <option value={5}>Other</option>
                    </select>
                    </div>
                </div>

                <div>
                    <label 
                    htmlFor="templateSubject"
                    className="block text-sm font-medium text-slate-700">
                        Subject
                    </label>
                    <input
                        id="templateSubject"
                        value={subject}
                        onChange={(event) => setSubject(event.target.value)}
                        onFocus={() => setActiveField("subject")}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                        placeholder="Following up on my <JobTitle> application"
                    />
                </div>

                <div>
                    <label 
                    htmlFor="templateBody"
                    className="block text-sm font-medium text-slate-700">
                        Body
                    </label>
                    <textarea
                        id="templateBody"
                        value={body}
                        onChange={(event) => setBody(event.target.value)}
                        onFocus={() => setActiveField("body")}
                        className="mt-1 min-h-36 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
                        placeholder="Hi, I wanted to follow up on my application for the <Job Title> position at <Company Name>."
                    />
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">
                        Insert job application info
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        Click a field below to insert it into the {activeField}.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {placeholders.map((placeholder) => (
                        <button
                            key={placeholder.value}
                            type="button"
                            onClick={() => insertPlaceholder(placeholder.value)}
                            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
                        >
                            {placeholder.label}
                        </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                {editingTemplateId && (
                    <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                        setEditingTemplateId(null);
                        setName("");
                        setType(0);
                        setSubject("");
                        setBody("");
                    }}
                    >
                        Cancel Edit
                    </Button>
                    )}

                    <Button
                        type="submit"
                        disabled={
                        createMutation.isPending ||
                        updateMutation.isPending ||
                        !name.trim() ||
                        !subject.trim() ||
                        !body.trim()
                        }
                    >
                        {editingTemplateId
                        ? updateMutation.isPending
                            ? "Saving..."
                            : "Save Changes"
                        : createMutation.isPending
                            ? "Creating..."
                            : "Create Template"}
                    </Button>
                </div>

                </form>
            </Card>

            <Card>
                <h2 className="text-lg font-semibold text-slate-900">
                    Saved Templates
                </h2>

                {isLoading && (
                <p className="mt-4 text-slate-600">Loading templates...</p>
                )}

                {isError && (
                <p className="mt-4 text-red-600">Failed to load templates.</p>
                )}

                {!isLoading && !isError && (!data || data.length === 0) && (
                <p className="mt-4 text-slate-600">No templates yet.</p>
                )}

                {data && data.length > 0 && (
                <div className="mt-4 space-y-3">
                    {data.map((template) => (
                    <div
                        key={template.id}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-slate-900">
                                {template.name}
                                </h3>

                                <p className="mt-1 text-sm text-slate-600">
                                {templateTypeLabels[template.type]}
                                </p>

                                <p className="mt-3 font-medium text-slate-800">
                                {template.subject}
                                </p>

                                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                                {template.body}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                    setEditingTemplateId(template.id);
                                    setName(template.name);
                                    setType(template.type);
                                    setSubject(template.subject);
                                    setBody(template.body);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                >
                                    Edit
                                </Button>

                                <Button
                                    type="button"
                                    variant="danger"
                                    onClick={() => setTemplateIdToDelete(template.id)}
                                    disabled={deleteMutation.isPending}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </Card>
        </div>

        <ConfirmDialog
            isOpen={Boolean(templateIdToDelete)}
            title="Delete email template?"
            description="This will permanently delete this email template. This action cannot be undone."
            confirmLabel="Delete template"
            isLoading={deleteMutation.isPending}
            onCancel={() => setTemplateIdToDelete(null)}
            onConfirm={() => {
                if (!templateIdToDelete) {
                    return;
                }

                deleteMutation.mutate(templateIdToDelete, {
                onSuccess: () => setTemplateIdToDelete(null),
                });
            }}
        />
    </main>
    );
}
