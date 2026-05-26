using JobTracker.Domain.Entities;

namespace JobTracker.Api.Contracts.Interviews;

public class CreateInterviewRequest
{
    public string Title { get; set; } = string.Empty;
    public InterviewType Type { get; set; }
    public DateTime ScheduledAt { get; set; }
    public int DurationMinutes { get; set; } = 60;
    public string? InterviewerName { get; set; }
    public string? MeetingLink { get; set; }
    public string? Location { get; set; }
    public string? Notes { get; set; }
}
