import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createEmailTemplate,
    deleteEmailTemplate,
    getEmailTemplates,
} from "../api/emailTemplatesApi";
import type { EmailTemplateType } from "../types/emailTemplate";

const templateTypeLabels: Record<number, string> = {
    0: "Follow Up",
    1: "Thank You",
    2: "Recruiter Outreach",
    3: "Interview Confirmation",
    4: "Withdrawal",
    5: "Other",
};

export function EmailTemplatesPage() {
    const queryClient = useQueryClient();

    const [name, setName] = useState("");
    const [type, setType] = useState<EmailTemplateType>(0);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");

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

    return (
    <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-6xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900">
                    Email Templates
                </h1>
                <p className="mt-2 text-slate-600">
                    Create reusable follow-up, thank-you, and recruiter outreach templates.
                </p>
            </div>

            <section className="rounded-2xl bg-white p-6 shadow">
                <h2 className="text-lg font-semibold text-slate-900">
                    Create Template
                </h2>

                <form
                onSubmit={(event) => {
                    event.preventDefault();

                    if (!name.trim() || !subject.trim() || !body.trim()) {
                        return;
                    }

                    createMutation.mutate();
                }}
                className="mt-4 space-y-4"
                >
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                    <label className="block text-sm font-medium"> Template Name </label>
                    <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="mt-1 w-full rounded-lg border px-3 py-2"
                        placeholder="Follow-up after application"
                    />
                    </div>

                    <div>
                        <label className="block text-sm font-medium"> Type </label>
                        <select
                            value={type}
                            onChange={(event) =>
                            setType(Number(event.target.value) as EmailTemplateType)
                            }
                            className="mt-1 w-full rounded-lg border px-3 py-2"
                        >
                            <option value={0}> Follow Up </option>
                            <option value={1}> Thank You </option>
                            <option value={2}> Recruiter Outreach </option>
                            <option value={3}> Interview Confirmation </option>
                            <option value={4}> Withdrawal </option>
                            <option value={5}> Other </option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium"> Subject </label>
                    <input
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    placeholder="Following up on my {{JobTitle}} application"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium"> Body </label>
                    <textarea
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    className="mt-1 min-h-36 w-full rounded-lg border px-3 py-2"
                    placeholder="Hi, I wanted to follow up on my application for the {{JobTitle}} position at {{CompanyName}}."
                    />
                </div>

                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                    Supported placeholders:{" "}
                    <code>{"{{CompanyName}}"}</code>, <code>{"{{JobTitle}}"}</code>,{" "}
                    <code>{"{{Location}}"}</code>, <code>{"{{DateApplied}}"}</code>,{" "}
                    <code>{"{{Deadline}}"}</code>
                </div>

                <button
                    type="submit"
                    disabled={
                    createMutation.isPending ||
                    !name.trim() ||
                    !subject.trim() ||
                    !body.trim()
                    }
                    className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
                >
                    {createMutation.isPending ? "Creating..." : "Create Template"}
                </button>
                </form>
            </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-slate-900">
            Saved Templates
            </h2>

            {isLoading && (
            <p className="mt-4 text-slate-600"> Loading templates... </p>
            )}

            {isError && (
            <p className="mt-4 text-red-600"> Failed to load templates. </p>
            )}

            {!isLoading && !isError && (!data || data.length === 0) && (
            <p className="mt-4 text-slate-600"> No templates yet. </p>
            )}

            {data && data.length > 0 && (
            <div className="mt-4 space-y-3">
                {data.map((template) => (
                <div
                    key={template.id}
                    className="rounded-lg border border-slate-200 p-4"
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

                    <button
                        type="button"
                        onClick={() => deleteMutation.mutate(template.id)}
                        disabled={deleteMutation.isPending}
                        className="text-sm text-red-600 hover:underline disabled:opacity-60"
                    >
                        Delete
                    </button>
                    </div>
                </div>
                ))}
            </div>
            )}
        </section>
        </div>
    </main>
    );
}
