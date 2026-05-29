import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JobApplicationForm } from "./JobApplicationForm";

const defaultValues = {
  companyName: "",
  jobTitle: "",
  location: "",
  jobUrl: "",
  status: 0,
  dateApplied: "",
  deadline: "",
  salaryRange: "",
  notes: "",
};

describe("JobApplicationForm", () => {
  it("renders form fields", () => {
    render(
      <JobApplicationForm
        defaultValues={defaultValues}
        submitLabel="Create Application"
        submittingLabel="Creating..."
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date applied/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/deadline/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/salary range/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it("shows validation errors when required fields are missing", async () => {
    const user = userEvent.setup();

    render(
      <JobApplicationForm
        defaultValues={defaultValues}
        submitLabel="Create Application"
        submittingLabel="Creating..."
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /create application/i }));

    expect(await screen.findByText(/company name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/job title is required/i)).toBeInTheDocument();
  });

  it("calls onSubmit with valid values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <JobApplicationForm
        defaultValues={defaultValues}
        submitLabel="Create Application"
        submittingLabel="Creating..."
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText(/company name/i), "Microsoft");
    await user.type(screen.getByLabelText(/job title/i), "Backend Developer");
    await user.selectOptions(screen.getByLabelText(/status/i), "1");

    await user.click(screen.getByRole("button", { name: /create application/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        companyName: "Microsoft",
        jobTitle: "Backend Developer",
        status: 1,
      }),
      expect.anything()
    );
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <JobApplicationForm
        defaultValues={defaultValues}
        submitLabel="Create Application"
        submittingLabel="Creating..."
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledOnce();
  });
});
