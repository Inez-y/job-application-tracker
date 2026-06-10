using JobTracker.Api.Contracts.Calendar;
using JobTracker.Api.Services;
using JobTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/calendar")]
public class CalendarController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public CalendarController(
        AppDbContext dbContext,
        ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    [HttpGet("events")]
    public async Task<ActionResult<List<CalendarEventResponse>>> GetEvents(
        [FromQuery] DateTime start,
        [FromQuery] DateTime end)
    {
        var userId = _currentUserService.UserId;

        if (start == default || end == default || start >= end)
        {
            return BadRequest("Valid start and end dates are required.");
        }

        start = DateTime.SpecifyKind(start, DateTimeKind.Utc);
        end = DateTime.SpecifyKind(end, DateTimeKind.Utc);

        var interviews = await _dbContext.Interviews
            .Include(x => x.JobApplication)
            .Where(x =>
                x.JobApplication != null &&
                x.JobApplication.UserId == userId &&
                x.ScheduledAt >= start &&
                x.ScheduledAt <= end)
            .Select(x => new CalendarEventResponse
            {
                Id = x.Id,
                JobApplicationId = x.JobApplicationId,
                Title = x.Title,
                CompanyName = x.JobApplication!.CompanyName,
                JobTitle = x.JobApplication.JobTitle,
                StartsAt = x.ScheduledAt,
                EndsAt = x.ScheduledAt.AddMinutes(x.DurationMinutes),
                Type = "Interview"
            })
            .ToListAsync();

        var reminders = await _dbContext.Reminders
            .Include(x => x.JobApplication)
            .Where(x =>
                x.JobApplication != null &&
                x.JobApplication.UserId == userId &&
                x.RemindAt >= start &&
                x.RemindAt <= end)
            .Select(x => new CalendarEventResponse
            {
                Id = x.Id,
                JobApplicationId = x.JobApplicationId,
                Title = x.Title,
                CompanyName = x.JobApplication!.CompanyName,
                JobTitle = x.JobApplication.JobTitle,
                StartsAt = x.RemindAt,
                EndsAt = null,
                Type = "Reminder"
            })
            .ToListAsync();

        var events = interviews
            .Concat(reminders)
            .OrderBy(x => x.StartsAt)
            .ToList();

        return Ok(events);
    }
}
