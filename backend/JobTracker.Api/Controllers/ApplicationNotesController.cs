using System.Security.Claims;
using JobTracker.Api.Contracts.ApplicationNotes;
using JobTracker.Api.Mappers;
using JobTracker.Domain.Entities;
using JobTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/job-applications/{jobApplicationId:guid}/notes")]
public class ApplicationNotesController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    public ApplicationNotesController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
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

    [HttpGet]
    public async Task<ActionResult<List<ApplicationNote>>> GetNotes(Guid jobApplicationId)
    {
        var userId = GetCurrentUserId();

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
        var userId = GetCurrentUserId();

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
        var userId = GetCurrentUserId();

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
}
