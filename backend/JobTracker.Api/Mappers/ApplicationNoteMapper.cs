using JobTracker.Api.Contracts.ApplicationNotes;
using JobTracker.Domain.Entities;

namespace JobTracker.Api.Mappers;

public static class ApplicationNoteMapper
{
    public static ApplicationNoteResponse ToResponse(this ApplicationNote note)
    {
        return new ApplicationNoteResponse
        {
            Id = note.Id,
            JobApplicationId = note.JobApplicationId,
            Content = note.Content,
            CreatedAt = note.CreatedAt
        };
    }
}
