using JobTracker.Domain.Entities;

namespace JobTracker.Api.Contracts.StatusHistory;

public sealed class UpdateStatusHistoryRequest
{
    public ApplicationStatus OldStatus { get; set; }
    public ApplicationStatus NewStatus { get; set; }
    public DateTime ChangedAt { get; set; }
}
