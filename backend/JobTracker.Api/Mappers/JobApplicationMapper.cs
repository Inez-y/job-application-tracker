using JobTracker.Api.Contracts.JobApplications;
using JobTracker.Domain.Entities;

namespace JobTracker.Api.Mappers;

public static class JobApplicationMapper
{
    public static JobApplicationResponse ToResponse(this JobApplication application)
    {
        return new JobApplicationResponse
        {
            Id = application.Id,
            CompanyName = application.CompanyName,
            JobTitle = application.JobTitle,
            Location = application.Location,
            JobUrl = application.JobUrl,
            Status = application.Status,
            DateApplied = application.DateApplied,
            Deadline = application.Deadline,
            SalaryRange = application.SalaryRange,
            Notes = application.Notes,
            CreatedAt = application.CreatedAt,
            UpdatedAt = application.UpdatedAt,
            Source = application.Source,
        };
    }
}
