using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobTracker.Api.Contracts.ApplicationNotes;
using JobTracker.Api.Mappers;
using JobTracker.Api.Services;
using JobTracker.Domain.Entities;
using JobTracker.Infrastructure.Data;
using JobTracker.Api.Contracts.ApplicationNOtes;

namespace JobTracker.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/job-applications/{jobApplicationId:guid}/notes")]
public class ApplicationNotesController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    public ApplicationNotesController(
        AppDbContext dbContext,
        ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ApplicationNote>>> GetNotes(Guid jobApplicationId)
    {
        var userId = _currentUserService.UserId;

        var jobExists = await _dbContext.JobApplications
            .AnyAsync(x => x.Id == jobApplicationId && x.UserId == userId);

        if (!jobExists)
        {
            return NotFound();
        }

        var notes = await _dbContext.ApplicationNotes
            .Where(x => x.JobApplicationId == jobApplicationId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(notes.Select(x => x.ToResponse()).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<ApplicationNote>> CreateNote(
        Guid jobApplicationId,
        CreateApplicationNoteRequest request)
    {
        var userId = _currentUserService.UserId;

        var jobExists = await _dbContext.JobApplications
            .AnyAsync(x => x.Id == jobApplicationId && x.UserId == userId);

        if (!jobExists)
        {
            return NotFound();
        }

        var note = new ApplicationNote
        {
            Id = Guid.NewGuid(),
            JobApplicationId = jobApplicationId,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow,
        };

        _dbContext.ApplicationNotes.Add(note);
        await _dbContext.SaveChangesAsync();

        return Ok(note.ToResponse());
    }

    [HttpDelete("{noteId:guid}")]
    public async Task<IActionResult> DeleteNote(
        Guid jobApplicationId,
        Guid noteId)
    {
        var userId = _currentUserService.UserId;

        var note = await _dbContext.ApplicationNotes
            .Include(x => x.JobApplication)
            .FirstOrDefaultAsync(x => 
                x.Id == noteId &&
                x.JobApplicationId == jobApplicationId &&
                x.JobApplication != null &&
                x.JobApplication.UserId == userId);

        if (note is null)
        {
            return NotFound();
        }

        _dbContext.ApplicationNotes.Remove(note);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{noteId:guid}")]
    public async Task<IActionResult> UpdateNote(
        Guid jobApplicationId,
        Guid noteId,
        UpdateApplicationNoteRequest request
    )
    {
        var userId = _currentUserService.UserId;

        var note = await _dbContext.ApplicationNotes
            .Include(x => x.JobApplication)
            .FirstOrDefaultAsync(x => 
                x.Id == noteId &&
                x.JobApplicationId == jobApplicationId &&
                x.JobApplication != null &&
                x.JobApplication.UserId == userId);

        if (note is null)
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest("Note content is required.");
        }

        note.Content = request.Content.Trim();

        await _dbContext.SaveChangesAsync();

        return NoContent();
    }
}
