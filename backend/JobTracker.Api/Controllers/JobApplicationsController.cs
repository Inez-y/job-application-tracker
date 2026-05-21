using System.Security.Claims;
using JobTracker.Api.Contracts.JobApplications;
using JobTracker.Domain.Entities;
using JobTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/job-applications")]
public class JobApplicationsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public JobApplicationsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<List<JobApplication>>> GetAll()
    {
        var userId = GetCurrentUserId();

        var applications = await _dbContext.JobApplications
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(applications);
    }

    [HttpPost]
    public async Task<ActionResult<JobApplication>> Create(CreateJobApplicationRequest request)
    {
        var userId = GetCurrentUserId();

        var application = new JobApplication
        {
          Id = Guid.NewGuid(),
          UserId = userId,
          CompanyName = request.CompanyName,
          JobTitle = request.JobTitle,  
          Location = request.Location,
          JobUrl = request.JobUrl,
          Status = request.Status,
          DateApplied = request.DateApplied,
          Deadline = request.Deadline,
          SalaryRange = request.SalaryRange,
          Notes = request.Notes,
          CreatedAt = DateTime.UtcNow,
          UpdatedAt = DateTime.UtcNow
        };

        _dbContext.JobApplications.Add(application);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = application.Id }, application);
    }

    private Guid GetCurrentUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue))
        {
            throw new UnauthorizedAccessException("User ID claim is missing.");
        }

        return Guid.Parse(userIdValue);
    }
}
