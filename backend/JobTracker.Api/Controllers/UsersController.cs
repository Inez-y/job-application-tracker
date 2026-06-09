using JobTracker.Api.Contracts.Users;
using JobTracker.Api.Services;
using JobTracker.Infrastructure.Data;
using JobTracker.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace JobTracker.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly IPasswordHasher<User> _passwordHasher;

    public UsersController(
        AppDbContext dbContext,
        ICurrentUserService currentUserService,
        IPasswordHasher<User> passwordHasher)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _passwordHasher = passwordHasher;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserProfileResponse>> GetMe()
    {
        var userId = _currentUserService.UserId;

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user is null)
        {
            return NotFound();
        }

        return Ok(new UserProfileResponse
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
        });
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe(UpdateUserProfileRequest request)
    {
        var userId = _currentUserService.UserId;

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user is null)
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(request.FirstName))
        {
            return BadRequest("First name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.LastName))
        {
            return BadRequest("Last name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest("Email is required.");
        }

        var normalizedEmail = request.Email.Trim().ToLower();

        var emailTaken = await _dbContext.Users.AnyAsync(x =>
            x.Id != userId &&
            x.Email == normalizedEmail);

        if (emailTaken)
        {
            return Conflict("Email is already in use.");
        }

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.Email = normalizedEmail;

        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("me/password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var userId = _currentUserService.UserId;

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user is null)
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(request.CurrentPassword))
        {
            return BadRequest("Current password is required.");
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 8)
        {
            return BadRequest("New password must be at least 8 characters.");
        }

        var passwordResult = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.CurrentPassword
        );

        if (passwordResult == PasswordVerificationResult.Failed)
        {
            return BadRequest("Current password is incorrect.");
        }

        user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);

        await _dbContext.SaveChangesAsync();

        return NoContent();
    }
}
