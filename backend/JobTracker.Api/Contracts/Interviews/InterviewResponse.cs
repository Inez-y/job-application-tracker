using JobTracker.Domain.Entities;

namespace JobTracker.Api.Contracts.Interviews;

public class InterviewResponse
{
    public Guid Id { get; set; }
    public Guid JobApplicationId { get; set; }
    public string Title { get; set; } = string.Empty;
    public InterviewType Type { get; set; }
    public DateTime ScheduledAt { get; set; }
    public int DurationMinutes { get; set; }
    public string? InterviewerName { get; set; }
    public string? MeetingLink { get; set; }
    public string? Location { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
