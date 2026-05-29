import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../components/ui/Button";
import type { ApplicationStatus } from "../../types/jobApplication";

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

export type JobApplicationFormInput = z.input<typeof schema>;
export type JobApplicationFormValues = z.output<typeof schema>;

type Props = {
  defaultValues: JobApplicationFormInput;
  submitLabel: string;
  submittingLabel: string;
  isSubmitting?: boolean;
  serverError?: string | null;
  showDelete?: boolean;
  onSubmit: (values: JobApplicationFormValues) => void | Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
};

export function JobApplicationForm({
  defaultValues,
  submitLabel,
  submittingLabel,
  isSubmitting = false,
  serverError,
  showDelete = false,
  onSubmit,
  onCancel,
  onDelete,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobApplicationFormInput, unknown, JobApplicationFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label 
        htmlFor="companyName"
        className="block text-sm font-medium text-slate-700">
          Company Name
        </label>

        <input
          id="companyName"
          {...register("companyName")}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
        />

        {errors.companyName && (
          <p className="mt-1 text-sm text-red-600">
            {errors.companyName.message}
          </p>
        )}
      </div>

      <div>
        <label 
        htmlFor="jobTitle"
        className="block text-sm font-medium text-slate-700">
          Job Title
        </label>

        <input
          id="jobTitle"
          {...register("jobTitle")}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
        />

        {errors.jobTitle && (
          <p className="mt-1 text-sm text-red-600">
            {errors.jobTitle.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label 
          htmlFor="location"
          className="block text-sm font-medium text-slate-700">
            Location
          </label>

          <input
            id="location"
            {...register("location")}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
            placeholder="Vancouver, Remote, etc."
          />
        </div>

        <div>
          <label 
          htmlFor="salaryRange"
          className="block text-sm font-medium text-slate-700">
            Salary Range
          </label>

          <input
            id="salaryRange"
            {...register("salaryRange")}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
            placeholder="$30-$40/hr"
          />
        </div>
      </div>

      <div>
        <label 
        htmlFor="jobUrl"
        className="block text-sm font-medium text-slate-700">
          Job URL
        </label>

        <input
          id="jobUrl"
          {...register("jobUrl")}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
          placeholder="https://example.com/job"
        />

        {errors.jobUrl && (
          <p className="mt-1 text-sm text-red-600">
            {errors.jobUrl.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label 
          htmlFor="status"
          className="block text-sm font-medium text-slate-700">
            Status
          </label>

          <select
            id="status"
            {...register("status")}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
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
          <label 
          htmlFor="dateApplied"
          className="block text-sm font-medium text-slate-700">
            Date Applied
          </label>

          <input
            id="dateApplied"
            type="date"
            {...register("dateApplied")}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label 
          htmlFor="deadline"
          className="block text-sm font-medium text-slate-700">
            Deadline
          </label>

          <input
            id="deadline"
            type="date"
            {...register("deadline")}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
          />
        </div>
      </div>

      <div>
        <label 
        htmlFor="notes"
        className="block text-sm font-medium text-slate-700">
          Notes
        </label>

        <textarea
          id="notes"
          {...register("notes")}
          className="mt-1 min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-900"
          placeholder="Add details about the application, recruiter, interview process, or follow-up plan."
        />
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        {showDelete && onDelete ? (
          <Button type="button" variant="danger" onClick={onDelete}>
            Delete
          </Button>
        ) : (
          <div />
        )}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function toApplicationStatus(value: number): ApplicationStatus {
  return value as ApplicationStatus;
}
