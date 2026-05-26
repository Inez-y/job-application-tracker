using System.Security.Claims;
using JobTracker.Api.Contracts.Reminders;
using JobTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/reminders")]
public class UserRemindersController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public UserRemindersController(AppDbContext dbContext)
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

    [HttpGet("upcoming")]
    public async Task<ActionResult<List<UpcomingReminderResponse>>> GetUpcomingReminders(
        [FromQuery] int days = 7)
    {
        var userId = GetCurrentUserId();

        if (days < 1)
        {
            days = 7;
        }

        if (days > 30)
        {
            days = 30;
        }

        var now = DateTime.UtcNow;
        var endDate = now.AddDays(days);

        var reminders = await _dbContext.Reminders
            .Include(x => x.JobApplication)
            .Where(x =>
                x.JobApplication != null &&
                x.JobApplication.UserId == userId &&
                !x.IsCompleted &&
                x.RemindAt >= now &&
                x.RemindAt <= endDate)
            .OrderBy(x => x.RemindAt)
            .Select(x => new UpcomingReminderResponse
            {
                Id = x.Id,
                JobApplicationId = x.JobApplicationId,
                CompanyName = x.JobApplication!.CompanyName,
                JobTitle = x.JobApplication.JobTitle,
                Title = x.Title,
                Type = x.Type,
                RemindAt = x.RemindAt,
                IsCompleted = x.IsCompleted
            })
            .ToListAsync();

        return Ok(reminders);
    }
}
