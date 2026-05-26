using JobTracker.Domain.Entities;

namespace JobTracker.Api.Contracts.Reminders;

public class UpcomingReminderResponse
{
    public Guid Id { get; set; }
    public Guid JobApplicationId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public ReminderType Type { get; set; }
    public DateTime RemindAt { get; set; }
    public bool IsCompleted { get; set; }

}