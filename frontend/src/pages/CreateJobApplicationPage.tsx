import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createJobApplication } from "../api/jobApplicationsApi";

const schema = z.object({
  companyName: z.string().min(1, "Company name is required."),
  jobTitle: z.string().min(1, "Job title is required."),
  location: z.string().optional(),
  jobUrl: z.string().url("Enter a valid URL.").optional().or(z.literal("")),
  status: z.coerce.number().min(0).max(6),
  dateApplied: z.string().optional(),
  deadline: z.string().optional(),
  salaryRange: z.string().optional(),
  notes: z.string().optional(),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export function CreateJobApplicationPage() {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } 
        = useForm<FormInput, unknown, FormValues>({
            resolver: zodResolver(schema),
            defaultValues: {
                companyName: "",
                jobTitle: "",
                location: "",
                jobUrl: "",
                status: 0,
                dateApplied: "",
                deadline: "",
                salaryRange: "",
                notes: "",
            },
        });

    async function onSubmit(values: FormValues) {
        setServerError(null);

        try {
            await createJobApplication({
                companyName: values.companyName,
                jobTitle: values.jobTitle,
                location: values.location || null,
                jobUrl: values.jobUrl || null,
                status: values.status as 0 | 1 | 2 | 3 | 4 | 5 | 6,
                dateApplied: values.dateApplied
                ? new Date(values.dateApplied).toISOString()
                : null,
                deadline: values.deadline
                ? new Date(values.deadline).toISOString()
                : null,
                salaryRange: values.salaryRange || null,
                notes: values.notes || null,
            });

            navigate("/applications");
        } catch {
            setServerError("Failed to create job application.");
        }
    }

    return (
         <main className="min-h-screen bg-slate-100 p-8">
            <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
                <h1 className="text-3xl font-bold text-slate-900">
                Add Job Application
                </h1>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Company Name</label>
                    <input
                    {...register("companyName")}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    {errors.companyName && (
                    <p className="text-sm text-red-600">{errors.companyName.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium">Job Title</label>
                    <input
                    {...register("jobTitle")}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                    {errors.jobTitle && (
                    <p className="text-sm text-red-600">{errors.jobTitle.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium">Location</label>
                    <input
                    {...register("location")}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    placeholder="Vancouver, Remote, etc."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Job URL</label>
                    <input
                    {...register("jobUrl")}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    placeholder="https://example.com/job"
                    />
                    {errors.jobUrl && (
                    <p className="text-sm text-red-600">{errors.jobUrl.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium">Status</label>
                    <select
                    {...register("status")}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    >
                    <option value={0}>Wishlist</option>
                    <option value={1}>Applied</option>
                    <option value={2}>Online Assessment</option>
                    <option value={3}>Interviewing</option>
                    <option value={4}>Offer</option>
                    <option value={5}>Rejected</option>
                    <option value={6}>Withdrawn</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium">Date Applied</label>
                    <input
                    type="date"
                    {...register("dateApplied")}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Deadline</label>
                    <input
                    type="date"
                    {...register("deadline")}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Salary Range</label>
                    <input
                    {...register("salaryRange")}
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    placeholder="$30-$40/hr"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Notes</label>
                    <textarea
                    {...register("notes")}
                    className="mt-1 min-h-28 w-full rounded-lg border px-3 py-2"
                    />
                </div>

                {serverError && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {serverError}
                    </p>
                )}

                <div className="flex gap-3">
                    <button
                    type="button"
                    onClick={() => navigate("/applications")}
                    className="rounded-lg border px-4 py-2"
                    >
                    Cancel
                    </button>

                    <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
                    >
                    {isSubmitting ? "Creating..." : "Create Application"}
                    </button>
                </div>
                </form>
            </div>
        </main>   
    );
}
