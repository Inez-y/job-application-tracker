using System.Security.Claims;
using JobTracker.Api.Contracts.EmailTemplates;
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
[Route("api/email-templates")]
public class EmailTemplatesController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    
    public EmailTemplatesController(
        AppDbContext dbContext,
        ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    private static string ApplyPlaceholders(string text, JobApplication application)
    {
        return text
            .Replace("{{CompanyName}}", application.CompanyName)
            .Replace("{{JobTitle}}", application.JobTitle)
            .Replace("{{Location}}", application.Location ?? "")
            .Replace("{{DateApplied}}", application.DateApplied?.ToString("yyyy-MM-dd") ?? "")
            .Replace("{{Deadline}}", application.Deadline?.ToString("yyyy-MM-dd") ?? "");
    }

    [HttpGet]
    public async Task<ActionResult<List<EmailTemplateResponse>>> GetTemplates()
    {
        var userId = _currentUserService.UserId;
        var templates = await _dbContext.EmailTemplates
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.Name)
            .ToListAsync();

        return Ok(templates.Select(x => x.ToResponse()).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EmailTemplateResponse>> GetTemplate(Guid id)
    {
        var userId = _currentUserService.UserId;

        var template = await _dbContext.EmailTemplates
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (template is null)
        {
            return NotFound();
        }

        return Ok(template.ToResponse());
    }

    [HttpPost]
    public async Task<ActionResult<EmailTemplateResponse>> CreateTemplate(
        CreateEmailTemplateRequest request)
    {
        var userId = _currentUserService.UserId;

        var template = new EmailTemplate
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            Type = request.Type,
            Subject = request.Subject,
            Body = request.Body,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.EmailTemplates.Add(template);
        await _dbContext.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetTemplate),
            new { id = template.Id },
            template.ToResponse()
        );
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<EmailTemplateResponse>> UpdateTemplate(
        Guid id,
        UpdateEmailTemplateRequest request)
    {
        var userId = _currentUserService.UserId;
        
        var template = await _dbContext.EmailTemplates
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (template is null)
        {
            return NotFound();
        }

        template.Name = request.Name;
        template.Type = request.Type;
        template.Subject = request.Subject;
        template.Body = request.Body;
        template.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return Ok(template.ToResponse());
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTemplate(Guid id)
    {
        var userId = _currentUserService.UserId;

        var template = await _dbContext.EmailTemplates
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (template is null)
        {
            return NotFound();
        }

        _dbContext.EmailTemplates.Remove(template);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("{templateId:guid}/preview/{jobApplicationId:guid}")]
    public async Task<ActionResult<PreviewEmailTemplateResponse>> PreviewTemplate(
        Guid templateId,
        Guid jobApplicationId)
    {
        var userId = _currentUserService.UserId;

        var template = await _dbContext.EmailTemplates
            .FirstOrDefaultAsync(x => x.Id == templateId && x.UserId == userId);

        if (template is null)
        {
            return NotFound("Template not found.");
        }

        var application = await _dbContext.JobApplications
            .FirstOrDefaultAsync(x => x.Id == jobApplicationId && x.UserId == userId);

        if (application is null)
        {
            return NotFound("Job application not found.");
        }

        var subject = ApplyPlaceholders(template.Subject, application);
        var body = ApplyPlaceholders(template.Body, application);

        return Ok(new PreviewEmailTemplateResponse
        {
            Subject = subject,
            Body = body
        });
    }
}