using JobTracker.Api.Contracts.Reminders;
using JobTracker.Domain.Entities;

namespace JobTracker.Api.Mappers;

public static class ReminderMapper
{
    public static ReminderResponse ToResponse(this Reminder reminder)
    {
        return new ReminderResponse
        {
            Id = reminder.Id,
            JobApplicationId = reminder.JobApplicationId,
            Title = reminder.Title,
            Type = reminder.Type,
            RemindAt = reminder.RemindAt,
            IsCompleted = reminder.IsCompleted,
            CreatedAt = reminder.CreatedAt,
            UpdatedAt = reminder.UpdatedAt
        };
    }
}
