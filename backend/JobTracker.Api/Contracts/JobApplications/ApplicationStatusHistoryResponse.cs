using JobTracker.Domain.Entities;

namespace JobTracker.Api.Contracts.JobApplications;

public class ApplicationStatusHistoryResponse
{
    public Guid Id { get; set; }
    public Guid JobApplicationId { get; set; }
    public ApplicationStatus OldStatus { get; set; }
    public ApplicationStatus NewStatus { get; set; }
    public DateTime ChangedAt { get; set; }
}
