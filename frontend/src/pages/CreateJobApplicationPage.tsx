import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJobApplication } from "../api/jobApplicationsApi";
import { Card } from "../components/ui/Card";
import {
  JobApplicationForm,
  type JobApplicationFormValues,
  toApplicationSource,
  toApplicationStatus,
} from "../features/jobApplications/JobApplicationForm";

export function CreateJobApplicationPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(values: JobApplicationFormValues) {
    setServerError(null);
    setIsSubmitting(true);

    try {
      await createJobApplication({
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

      navigate("/applications");
    } catch {
      setServerError("Failed to create job application.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">
              Add Job Application
            </h1>
            <p className="mt-2 text-slate-600">
              Track a new role, deadline, status, and notes.
            </p>
          </div>

          <JobApplicationForm
            defaultValues={{
              companyName: "",
              jobTitle: "",
              location: "",
              jobUrl: "",
              status: 0,
              dateApplied: "",
              deadline: "",
              salaryRange: "",
              notes: "",
              source: 0,
            }}
            submitLabel="Create Application"
            submittingLabel="Creating..."
            isSubmitting={isSubmitting}
            serverError={serverError}
            onSubmit={onSubmit}
            onCancel={() => navigate("/applications")}
          />
        </Card>
      </div>
    </main>
  );
}
