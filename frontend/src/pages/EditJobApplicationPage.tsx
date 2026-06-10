import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Card } from "../components/ui/Card";
import {
  deleteJobApplication,
  getJobApplicationById,
  updateJobApplication,
} from "../api/jobApplicationsApi";
import {
  JobApplicationForm,
  type JobApplicationFormValues,
  toApplicationSource,
  toApplicationStatus,
} from "../features/jobApplications/JobApplicationForm";


function toDateInputValue(value: string | null): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export function EditJobApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["jobApplication", id],
    queryFn: () => getJobApplicationById(id!),
    enabled: Boolean(id),
  });

  async function onSubmit(values: JobApplicationFormValues) {
    if (!id) {
      return;
    }

    setServerError(null);
    setIsSubmitting(true);

    try {
      await updateJobApplication(id, {
        companyName: values.companyName,
        jobTitle: values.jobTitle,
        location: values.location || null,
        jobUrl: values.jobUrl || null,
        status: toApplicationStatus(values.status),
        dateApplied: values.dateApplied
          ? new Date(values.dateApplied).toISOString()
          : null,
        deadline: values.deadline
          ? new Date(values.deadline).toISOString()
          : null,
        salaryRange: values.salaryRange || null,
        notes: values.notes || null,
        source: toApplicationSource(values.source),
      });

      navigate(`/applications/${id}`);
    } catch {
      setServerError("Failed to update job application.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!id) {
      return;
    }

    setServerError(null);
    setIsDeleting(true);

    try {
      await deleteJobApplication(id);
      navigate("/applications");
    } catch {
      setServerError("Failed to delete job application.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  if (isLoading) {
    return <main className="p-8">Loading application...</main>;
  }

  if (isError || !data) {
    return (
      <main className="p-8">
        <p className="text-red-600">Failed to load application.</p>
        <Link to="/applications" className="mt-4 inline-block underline">
          Back to applications
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <div className="mb-6">
            <Link
              to={`/applications/${id}`}
              className="text-sm text-slate-600 underline"
            >
              Back to details
            </Link>

            <h1 className="mt-6 text-3xl font-bold text-slate-900">
              Edit Job Application
            </h1>

            <p className="mt-2 text-slate-600">
              Update the company, role, status, deadline, and notes for this
              application.
            </p>
          </div>

          <JobApplicationForm
            defaultValues={{
              companyName: data.companyName,
              jobTitle: data.jobTitle,
              location: data.location ?? "",
              jobUrl: data.jobUrl ?? "",
              status: data.status,
              dateApplied: toDateInputValue(data.dateApplied),
              deadline: toDateInputValue(data.deadline),
              salaryRange: data.salaryRange ?? "",
              notes: data.notes ?? "",
              source: data.source,
            }}
            submitLabel="Save Changes"
            submittingLabel="Saving..."
            isSubmitting={isSubmitting}
            serverError={serverError}
            showDelete
            onSubmit={onSubmit}
            onCancel={() => navigate(`/applications/${id}`)}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
        </Card>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete job application?"
        description="This will permanently delete this job application and its related notes, interviews, reminders, and documents. This action cannot be undone."
        confirmLabel="Delete application"
        isLoading={isDeleting}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </main>
  );
}
