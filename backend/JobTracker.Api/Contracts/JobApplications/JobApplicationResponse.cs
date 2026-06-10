using JobTracker.Domain.Entities;

namespace JobTracker.Api.Contracts.JobApplications;

public class JobApplicationResponse
{
    public Guid Id { get; set; }

    public string CompanyName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string? Location { get; set; }
    public string? JobUrl { get; set; }
    public ApplicationStatus Status { get; set; }
    public DateTime? DateApplied { get; set; }
    public DateTime? Deadline { get; set; }
    public string? SalaryRange { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ApplicationSource Source { get; set; }
}
