using System.Security.Claims;
using JobTracker.Api.Contracts.Reminders;
using JobTracker.Api.Mappers;
using JobTracker.Api.Services;
using JobTracker.Domain.Entities;
using JobTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/job-applications/{jobApplicationId:guid}/reminders")]
public class RemindersController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public RemindersController(
        AppDbContext dbContext,
        ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ReminderResponse>>> GetReminders(Guid jobApplicationId)
    {
        var userId = _currentUserService.UserId;

        var jobExists = await _dbContext.JobApplications
            .AnyAsync(x => x.Id == jobApplicationId && x.UserId == userId);

        if (!jobExists)
        {
            return NotFound();
        }

        var reminders = await _dbContext.Reminders
            .Where(x => x.JobApplicationId == jobApplicationId)
            .OrderBy(x => x.RemindAt)
            .ToListAsync();

        return Ok(reminders.Select(x => x.ToResponse()).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<ReminderResponse>> CreateReminder(
        Guid jobApplicationId,
        CreateReminderRequest request)
    {
        var userId = _currentUserService.UserId;

        var jobExists = await _dbContext.JobApplications
            .AnyAsync(x => x.Id == jobApplicationId && x.UserId == userId);

        if (!jobExists)
        {
            return NotFound();
        }

        var reminder = new Reminder
        {
            Id = Guid.NewGuid(),
            JobApplicationId = jobApplicationId,
            Title = request.Title,
            Type = request.Type,
            RemindAt = request.RemindAt,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.Reminders.Add(reminder);
        await _dbContext.SaveChangesAsync();

        return Ok(reminder.ToResponse());
    }

    [HttpPut("{reminderId:guid}")]
    public async Task<ActionResult<ReminderResponse>> UpdateReminder(
        Guid jobApplicationId,
        Guid reminderId,
        UpdateReminderRequest request)
    {
        var userId = _currentUserService.UserId;

        var reminder = await _dbContext.Reminders
            .Include(x => x.JobApplication)
            .FirstOrDefaultAsync(x =>
                x.Id == reminderId &&
                x.JobApplicationId == jobApplicationId &&
                x.JobApplication != null &&
                x.JobApplication.UserId == userId);

        if (reminder is null)
        {
            return NotFound();
        }

        reminder.Title = request.Title;
        reminder.Type = request.Type;
        reminder.RemindAt = request.RemindAt;
        reminder.IsCompleted = request.IsCompleted;
        reminder.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return Ok(reminder.ToResponse());
    }

    [HttpDelete("{reminderId:guid}")]
    public async Task<IActionResult> DeleteReminder(
        Guid jobApplicationId,
        Guid reminderId)
    {
        var userId = _currentUserService.UserId;

        var reminder = await _dbContext.Reminders
            .Include(x => x.JobApplication)
            .FirstOrDefaultAsync(x =>
                x.Id == reminderId &&
                x.JobApplicationId == jobApplicationId &&
                x.JobApplication != null &&
                x.JobApplication.UserId == userId);

        if (reminder is null)
        {
            return NotFound();
        }

        _dbContext.Reminders.Remove(reminder);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{reminderId:guid}/complete")]
    public async Task<ActionResult<ReminderResponse>> MarkComplete(
        Guid jobApplicationId,
        Guid reminderId)
    {
        var userId = _currentUserService.UserId;

        var reminder = await _dbContext.Reminders
        .Include(x => x.JobApplication)
        .FirstOrDefaultAsync(x =>
            x.Id == reminderId &&
            x.JobApplicationId == jobApplicationId &&
            x.JobApplication != null &&
            x.JobApplication.UserId == userId);

        if (reminder is null)
        {
            return NotFound();
        }

        reminder.IsCompleted = true;
        reminder.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return Ok(reminder.ToResponse());
    }

    [HttpPatch("{reminderId:guid}/incomplete")]
    public async Task<ActionResult<ReminderResponse>> MarkIncomplete(
        Guid jobApplicationId,
        Guid reminderId)
    {
        var userId = _currentUserService.UserId;

        var reminder = await _dbContext.Reminders
            .Include(x => x.JobApplication)
            .FirstOrDefaultAsync(x =>
                x.Id == reminderId &&
                x.JobApplicationId == jobApplicationId &&
                x.JobApplication != null &&
                x.JobApplication.UserId == userId);

        if (reminder is null)
        {
            return NotFound();
        }

        reminder.IsCompleted = false;
        reminder.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return Ok(reminder.ToResponse());
    }
}
