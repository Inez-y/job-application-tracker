using JobTracker.Api.Contracts.JobApplications;
using JobTracker.Domain.Entities;
using JobTracker.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobTracker.Api.Mappers;
using JobTracker.Api.Contracts.Common;
using JobTracker.Api.Services;

namespace JobTracker.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/job-applications")]
public class JobApplicationsController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public JobApplicationsController(
        AppDbContext dbContext,
        ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<JobApplicationResponse>>> GetAll(
        [FromQuery] GetJobApplicationsQuery query)
    {
        var userId = _currentUserService.UserId;

        var applicationsQuery = _dbContext.JobApplications
            .Where(x => x.UserId == userId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();

            applicationsQuery = applicationsQuery
                .Where(x => x.CompanyName.ToLower().Contains(search) ||
                            x.JobTitle.ToLower().Contains(search) ||
                            (x.Location != null && x.Location.ToLower().Contains(search))
                        );
                        
        }

        if (query.Status.HasValue)
        {
            applicationsQuery = applicationsQuery
                .Where(x => x.Status == query.Status.Value);
        }

        var sortBy = query.SortBy?.Trim().ToLower();
        var sortDirection = query.SortDirection?.Trim().ToLower();

        applicationsQuery = sortBy switch
        {
            "company" => sortDirection == "asc"
                ? applicationsQuery.OrderBy(x => x.CompanyName)
                : applicationsQuery.OrderByDescending(x => x.CompanyName),

            "jobtitle" => sortDirection == "asc"
                ? applicationsQuery.OrderBy(x => x.JobTitle)
                : applicationsQuery.OrderByDescending(x => x.JobTitle),

            "deadline" => sortDirection == "asc"
                ? applicationsQuery.OrderBy(x => x.Deadline)
                : applicationsQuery.OrderByDescending(x => x.Deadline),

            "dateapplied" => sortDirection == "asc"
                ? applicationsQuery.OrderBy(x => x.DateApplied)
                : applicationsQuery.OrderByDescending(x => x.DateApplied),

            "dateupdated" => sortDirection == "asc"
                ? applicationsQuery.OrderBy(x => x.UpdatedAt)
                : applicationsQuery.OrderByDescending(x => x.UpdatedAt),

            _ => sortDirection == "asc"
                ? applicationsQuery.OrderBy(x => x.CreatedAt)
                : applicationsQuery.OrderByDescending(x => x.CreatedAt)
        };

        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize < 1 ? 10 : query.PageSize;
        pageSize = pageSize > 50 ? 50 : pageSize;

        var totalCount = await applicationsQuery.CountAsync();

        var applications = await applicationsQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var response = new PagedResponse<JobApplicationResponse>
        {
            Items = applications.Select(x => x.ToResponse()).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<JobApplicationResponse>> Create(CreateJobApplicationRequest request)
    {
        var userId = _currentUserService.UserId;

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

        return CreatedAtAction(
            nameof(GetAll), 
            new { id = application.Id }, 
            application.ToResponse()
        );
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<JobApplicationResponse>> GetById(Guid id)
    {
        var userId = _currentUserService.UserId;
        
        var application = await _dbContext.JobApplications
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (application is null)
        {
            return NotFound();
        }

        return Ok(application.ToResponse());
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<JobApplication>> Update(
        Guid id,
        UpdateJobApplicationRequest request)
    {
        var userId = _currentUserService.UserId;

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

        return Ok(application.ToResponse());
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = _currentUserService.UserId;

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
        var userId = _currentUserService.UserId;

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
