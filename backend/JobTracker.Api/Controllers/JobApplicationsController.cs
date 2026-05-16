using JobTracker.Domain.Entities;
using JobTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Controllers;

[ApiController]
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
        var applications = await _dbContext.JobApplications
                                        .OrderByDescending(x => x.CreatedAt)
                                        .ToListAsync();

        return Ok(applications);
    }

    [HttpPost]
    public async Task<ActionResult<JobApplication>> Create(JobApplication application)
    {
        application.Id = Guid.NewGuid();
        application.CreatedAt = DateTime.UtcNow;
        application.UpdatedAt = DateTime.UtcNow;

        _dbContext.JobApplications.Add(application);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = application.Id }, application);
    }
}
