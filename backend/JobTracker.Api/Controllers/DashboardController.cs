using JobTracker.Api.Contracts.Dashboard;
using JobTracker.Api.Services;
using JobTracker.Domain.Entities;
using JobTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;


    public DashboardController(
        AppDbContext dbContext,
        ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsResponse>> GetStats()
    {
        var userId = _currentUserService.UserId;

        var applications = _dbContext.JobApplications
            .Where(x => x.UserId == userId);

        var now = DateTime.UtcNow;
        var nextSevenDays = now.AddDays(7);
        var sixMonthsAgo = new DateTime(
                now.Year,
                now.Month,
                1,
                0,
                0,
                0,
                DateTimeKind.Utc
            ).AddMonths(-5);

        var reminders = _dbContext.Reminders
            .Where(x => x.JobApplication.UserId == userId);

        var applicationTrendRaw = await applications
            .Where(x =>
                x.DateApplied != null &&
                x.DateApplied >= sixMonthsAgo)
            .GroupBy(x => new
            {
                x.DateApplied!.Value.Year,
                x.DateApplied!.Value.Month
            })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Count = g.Count()
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToListAsync();

        var applicationTrend = applicationTrendRaw
            .Select(x => new ApplicationTrendResponse
            {
                Month = $"{x.Year}-{x.Month:D2}",
                Count = x.Count
            })
            .ToList();

        var response = new DashboardStatsResponse
        {
            TotalApplications = await applications.CountAsync(),

            WishlistCount = await applications.CountAsync(x => x.Status == ApplicationStatus.Wishlist),
            AppliedCount = await applications.CountAsync(x => x.Status == ApplicationStatus.Applied),
            OnlineAssessmentCount = await applications.CountAsync(x => x.Status == ApplicationStatus.OnlineAssessment),
            InterviewingCount = await applications.CountAsync(x => x.Status == ApplicationStatus.Interviewing),
            OfferCount = await applications.CountAsync(x => x.Status == ApplicationStatus.Offer),
            RejectedCount = await applications.CountAsync(x => x.Status == ApplicationStatus.Rejected),
            WithdrawnCount = await applications.CountAsync(x => x.Status == ApplicationStatus.Withdrawn),
            CompletedReminderCount = await reminders.CountAsync(x => x.IsCompleted),
            PendingReminderCount = await reminders.CountAsync(x => !x.IsCompleted),
            ApplicationTrend = applicationTrend,

            UpcomingDeadlineCount = await applications.CountAsync(x =>
                x.Deadline != null &&
                x.Deadline >= now &&
                x.Deadline <= nextSevenDays),

            RecentApplications = await applications
                .OrderByDescending(x => x.CreatedAt)
                .Take(5)
                .Select(x => new RecentApplicationResponse
                {
                    Id = x.Id,
                    CompanyName = x.CompanyName,
                    JobTitle = x.JobTitle,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt
                })
                .ToListAsync(),

            UpcomingDeadlines = await applications
                .Where(x =>
                    x.Deadline != null &&
                    x.Deadline >= now &&
                    x.Deadline <= nextSevenDays)
                .OrderBy(x => x.Deadline)
                .Take(5)
                .Select(x => new UpcomingDeadlineResponse
                {
                    Id = x.Id,
                    CompanyName = x.CompanyName,
                    JobTitle = x.JobTitle,
                    Deadline = x.Deadline
                })
                .ToListAsync()
        };

        return Ok(response);
    }
}
