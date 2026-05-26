using JobTracker.Domain.Entities;

namespace JobTracker.Api.Contracts.Reminders;

public class ReminderResponse
{
    public Guid Id { get; set; }
    public Guid JobApplicationId { get; set; }
    public string Title { get; set; } = string.Empty;
    public ReminderType Type { get; set; }
    public DateTime RemindAt { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
