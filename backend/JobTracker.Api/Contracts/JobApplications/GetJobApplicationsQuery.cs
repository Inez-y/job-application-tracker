using JobTracker.Domain.Entities;

namespace JobTracker.Api.Contracts.JobApplications;

public class GetJobApplicationQuery
{
    public string? Search { get; set; }
    public ApplicationStatus? Status { get; set; }
    public string? SortBy { get; set; } = "createdAt";
    public string? SortDirection { get; set; } = "desc";
}
