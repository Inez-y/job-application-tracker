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

    private Guid GetCurrentUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue))
        {
            throw new UnauthorizedAccessException("User ID claim is missing.");
        }

        return Guid.Parse(userIdValue);
    }

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

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<JobApplication>> GetById(Guid id)
    {
        var userId = GetCurrentUserId();
        
        var application = await _dbContext.JobApplications
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (application is null)
        {
            return NotFound();
        }

        return Ok(application);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<JobApplication>> Update(
        Guid id,
        UpdateJobApplicationRequest request)
    {
        var userId = GetCurrentUserId();

        var application = await _dbContext.JobApplications
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (application is null)
        {
            return NotFound();
        }

        var oldStatus = application.Status;

        application.CompanyName = request.CompanyName;
        application.JobTitle = request.JobTitle;
        application.Location = request.Location;
        application.JobUrl = request.JobUrl;
        application.Status = request.Status;
        application.DateApplied = request.DateApplied;
        application.Deadline = request.Deadline;
        application.SalaryRange = request.SalaryRange;
        application.Notes = request.Notes;
        application.UpdatedAt = DateTime.UtcNow;

        if (oldStatus != request.Status)
        {
            var history = new ApplicationStatusHistory
            {
                Id = Guid.NewGuid(),
                JobApplicationId = application.Id,
                OldStatus = oldStatus,
                NewStatus = request.Status,
                ChangedAt = DateTime.UtcNow
            };

            _dbContext.ApplicationStatusHistories.Add(history);
        }

        await _dbContext.SaveChangesAsync();

        return Ok(application);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();

        var application = await _dbContext.JobApplications
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (application is null)
        {
            return NotFound();
        }

        _dbContext.JobApplications.Remove(application);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("{id:guid}/status-history")]
    public async Task<ActionResult<List<ApplicationStatusHistory>>> GetStatusHistory(Guid id)
    {
        var userId = GetCurrentUserId();

        var jobExists = await _dbContext.JobApplications
            .AnyAsync(x => x.Id == id && x.UserId == userId);

        if (!jobExists)
        {
            return NotFound();
        }

        var history = await _dbContext.ApplicationStatusHistories
            .Where(x => x.JobApplicationId == id)
            .OrderByDescending(x => x.ChangedAt)
            .ToListAsync();

        return Ok(history);
    }
}
