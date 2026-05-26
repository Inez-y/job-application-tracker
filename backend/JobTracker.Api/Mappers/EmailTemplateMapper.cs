using JobTracker.Api.Contracts.EmailTemplates;
using JobTracker.Domain.Entities;

namespace JobTracker.Api.Mappers;

public static class EmailTemplateMapper
{
    public static EmailTemplateResponse ToResponse(this EmailTemplate template)
    {
        return new EmailTemplateResponse
        {
            Id = template.Id,
            Name = template.Name,
            Type = template.Type,
            Subject = template.Subject,
            Body = template.Body,
            CreatedAt = template.CreatedAt,
            UpdatedAt = template.UpdatedAt
        };
    }
}
