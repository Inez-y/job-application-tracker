using JobTracker.Domain.Entities;

namespace JobTracker.Api.Contracts.JobApplications;

public class CreateJobApplicationRequest
{
    public string CompanyName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string? Location { get; set; } 
    public string? JobUrl { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Wishlist;
    public DateTime? DateApplied { get; set; }
    public DateTime? Deadline { get; set; }
    public string? SalaryRange { get; set; }
    public string? Notes { get; set; }
}