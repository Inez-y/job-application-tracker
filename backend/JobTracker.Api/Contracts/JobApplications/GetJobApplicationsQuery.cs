using JobTracker.Domain.Entities;

namespace JobTracker.Api.Contracts.JobApplications;

public class GetJobApplicationsQuery
{
    public string? Search { get; set; }
    public ApplicationStatus? Status { get; set; }
    public string? SortBy { get; set; } = "createdAt";
    public string? SortDirection { get; set; } = "desc";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public ApplicationSource Source { get; set; }
}
