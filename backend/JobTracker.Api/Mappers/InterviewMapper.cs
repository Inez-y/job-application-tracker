using JobTracker.Api.Contracts.Interviews;
using JobTracker.Domain.Entities;

namespace JobTracker.Api.Mappers;

public static class InterviewMapper
{
    public static InterviewResponse ToResponse(this Interview interview)
    {
        return new InterviewResponse
        {
            Id = interview.Id,
            JobApplicationId = interview.JobApplicationId,
            Title = interview.Title,
            Type = interview.Type,
            ScheduledAt = interview.ScheduledAt,
            DurationMinutes = interview.DurationMinutes,
            InterviewerName = interview.InterviewerName,
            MeetingLink = interview.MeetingLink,
            Location = interview.Location,
            Notes = interview.Notes,
            CreatedAt = interview.CreatedAt,
            UpdatedAt = interview.UpdatedAt
        };
    }
}
