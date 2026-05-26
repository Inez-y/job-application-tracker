using JobTracker.Api.Contracts.Documents;
using JobTracker.Domain.Entities;

namespace JobTracker.Api.Mappers;

public static class DocumentMapper
{
    public static DocumentResponse ToResponse(this Document document)
    {
        return new DocumentResponse
        {
            Id = document.Id,
            JobApplicationId = document.JobApplicationId,
            OriginalFileName = document.OriginalFileName,
            ContentType = document.ContentType,
            SizeBytes = document.SizeBytes,
            Type = document.Type,
            UploadedAt = document.UploadedAt
        };
    }
}
