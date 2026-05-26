using System.Security.Claims;
using JobTracker.Api.Mappers;
using JobTracker.Domain.Entities;
using JobTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/job-applications/{jobApplicationId:guid}/documents")]
public class DocumentsController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly IWebHostEnvironment _environment;

    public DocumentsController(AppDbContext dbContext, IWebHostEnvironment environment)
    {
        _dbContext = dbContext;
        _environment = environment;
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
    public async Task<IActionResult> GetDocuments(Guid jobApplicationId)
    {
        var userId = GetCurrentUserId();

        var jobExists = await _dbContext.JobApplications
            .AnyAsync(x => x.Id == jobApplicationId && x.UserId == userId);

        if (!jobExists)
        {
            return NotFound();
        }

        var documents = await _dbContext.Documents
            .Where(x => x.JobApplicationId == jobApplicationId)
            .OrderByDescending(x => x.UploadedAt)
            .ToListAsync();

        return Ok(documents.Select(x => x.ToResponse()).ToList());
    }

    [HttpPost]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> UploadDocument(
        Guid jobApplicationId,
        IFormFile file,
        [FromForm] DocumentType type)
    {
        var userId = GetCurrentUserId();

        var jobExists = await _dbContext.JobApplications
            .AnyAsync(x => x.Id == jobApplicationId && x.UserId == userId);

        if (!jobExists)
        {
            return NotFound();
        }

        if (file.Length == 0)
        {
            return BadRequest("File is empty.");
        }

        var allowedContentTypes = new[]
        {
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
        };

        if (!allowedContentTypes.Contains(file.ContentType))
        {
            return BadRequest("Only PDF, DOC, DOCX, and TXT files are allowed.");
        }

        var uploadsFolder = Path.Combine(
            _environment.ContentRootPath,
            "uploads",
            "documents"
        );

        Directory.CreateDirectory(uploadsFolder);

        var extension = Path.GetExtension(file.FileName);
        var storedFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, storedFileName);

        await using (var stream = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(stream);
        }

        var document = new Document
        {
            Id = Guid.NewGuid(),
            JobApplicationId = jobApplicationId,
            OriginalFileName = file.FileName,
            StoredFileName = storedFileName,
            ContentType = file.ContentType,
            SizeBytes = file.Length,
            Type = type,
            UploadedAt = DateTime.UtcNow
        };

        _dbContext.Documents.Add(document);
        await _dbContext.SaveChangesAsync();

        return Ok(document.ToResponse());
    }

    [HttpDelete("{documentId:guid}")]
    public async Task<IActionResult> DeleteDocument(
        Guid jobApplicationId,
        Guid documentId)
    {
        var userId = GetCurrentUserId();

        var document = await _dbContext.Documents
            .Include(x => x.JobApplication)
            .FirstOrDefaultAsync(x =>
                x.Id == documentId &&
                x.JobApplicationId == jobApplicationId &&
                x.JobApplication != null &&
                x.JobApplication.UserId == userId);

        if (document is null)
        {
            return NotFound();
        }

        var filePath = Path.Combine(
            _environment.ContentRootPath,
            "uploads",
            "documents",
            document.StoredFileName
        );

        if (System.IO.File.Exists(filePath))
        {
            System.IO.File.Delete(filePath);
        }

        _dbContext.Documents.Remove(document);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("{documentId:guid}/download")]
    public async Task<IActionResult> DownloadDocument(
        Guid jobApplicationId,
        Guid documentId)
    {
        var userId = GetCurrentUserId();

        var document = await _dbContext.Documents
            .Include(x => x.JobApplication)
            .FirstOrDefaultAsync(x =>
                x.Id == documentId &&
                x.JobApplicationId == jobApplicationId &&
                x.JobApplication != null &&
                x.JobApplication.UserId == userId);

        if (document is null)
        {
            return NotFound();
        }

        var filePath = Path.Combine(
            _environment.ContentRootPath,
            "uploads",
            "documents",
            document.StoredFileName
        );

        if (!System.IO.File.Exists(filePath))
        {
            return NotFound("File not found on server.");
        }

        var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);

        return File(
            fileBytes,
            document.ContentType,
            document.OriginalFileName
        );
    }
}
