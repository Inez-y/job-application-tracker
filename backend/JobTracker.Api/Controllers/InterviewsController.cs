using System.Security.Claims;
using JobTracker.Api.Contracts.Interviews;
using JobTracker.Api.Mappers;
using JobTracker.Domain.Entities;
using JobTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/job-applications/{jobApplicationId:guid}/interviews")]
public class InterviewsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public InterviewsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    private Guid GetCurrentUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userIdValue))
        {
            throw new UnauthorizedAccessException("User Id claim is missing.");
        }

        return Guid.Parse(userIdValue);
    }

    [HttpGet]
    public async Task<ActionResult<List<InterviewResponse>>> GetInterviews(Guid jobApplicationId)
    {
        var userId = GetCurrentUserId();

        var jobExists = await _dbContext.JobApplications
            .AnyAsync(x => x.Id == jobApplicationId && x.UserId == userId);

        if (!jobExists)
        {
            return NotFound();
        }

        var interviews = await _dbContext.Interviews
            .Where(x => x.JobApplicationId == jobApplicationId)
            .OrderBy(x => x.ScheduledAt)
            .ToListAsync();

        return Ok(interviews.Select(x => x.ToResponse()).ToList());
    }

    [HttpGet("{interviewId:guid}")]
    public async Task<ActionResult<InterviewResponse>> GetInterview(
        Guid jobApplicationId,
        Guid interviewId
    )
    {
        var userId = GetCurrentUserId();

        var interview = await _dbContext.Interviews
            .Include(x => x.JobApplication)
            .FirstOrDefaultAsync(x =>
                x.Id == interviewId &&
                x.JobApplicationId == jobApplicationId &&
                x.JobApplication != null &&
                x.JobApplication.UserId == userId);

        if (interview is null)
        {
            return NotFound();
        }

        return Ok(interview.ToResponse());
    }

    [HttpPost]
    public async Task<ActionResult<InterviewResponse>> CreateInterview(
        Guid jobApplicationId,
        CreateInterviewRequest request)
    {
        var userId = GetCurrentUserId();

        var jobExists = await _dbContext.JobApplications
            .AnyAsync(x => x.Id == jobApplicationId && x.UserId == userId);

        if (!jobExists)
        {
            return NotFound();
        }

        var interview = new Interview
        {
            Id = Guid.NewGuid(),
            JobApplicationId = jobApplicationId,
            Title = request.Title,
            Type = request.Type,
            ScheduledAt = request.ScheduledAt,
            DurationMinutes = request.DurationMinutes,
            InterviewerName = request.InterviewerName,
            MeetingLink = request.MeetingLink,
            Location = request.Location,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.Interviews.Add(interview);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetInterview),
            new { jobApplicationId, interviewId = interview.Id },
            interview.ToResponse()
        );
    }

    [HttpPut("{interviewId:guid}")]
    public async Task<ActionResult<InterviewResponse>> UpdateInterview(
        Guid jobApplicationId,
        Guid interviewId,
        UpdateInterviewRequest request)
    {
        var userId = GetCurrentUserId();

        var interview = await _dbContext.Interviews
            .Include(x => x.JobApplication)
            .FirstOrDefaultAsync(x => 
                x.Id == interviewId &&
                x.JobApplicationId == jobApplicationId &&
                x.JobApplication != null &&
                x.JobApplication.UserId == userId);

        if (interview is null)
        {
            return NotFound();
        }

        interview.Title = request.Title;
        interview.Type = request.Type;
        interview.ScheduledAt = request.ScheduledAt;
        interview.DurationMinutes = request.DurationMinutes;
        interview.InterviewerName = request.InterviewerName;
        interview.MeetingLink = request.MeetingLink;
        interview.Location = request.Location;
        interview.Notes = request.Notes;
        interview.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return Ok(interview.ToResponse());

    }
    
    [HttpDelete("{interviewId:guid}")]
    public async Task<IActionResult> DeleteInterview(
        Guid jobApplicationId, 
        Guid interviewId)
    {
        var userId = GetCurrentUserId();
        
        var interview = await _dbContext.Interviews
            .Include(x => x.JobApplication)
            .FirstOrDefaultAsync(x =>
                x.Id == interviewId &&
                x.JobApplicationId == jobApplicationId &&
                x.JobApplication != null &&
                x.JobApplication.UserId == userId);

        if (interview is null)
        {
            return NotFound();
        }

        _dbContext.Interviews.Remove(interview);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }
}