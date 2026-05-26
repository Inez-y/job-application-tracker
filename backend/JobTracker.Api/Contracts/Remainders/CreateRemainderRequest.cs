using JobTracker.Domain.Entities;

namespace JobTracker.Api.Contracts.Reminders;

public class CreateReminderRequest
{
    public string Title { get; set; } = string.Empty;
    public ReminderType Type { get; set; }
    public DateTime RemindAt { get; set; }
}
