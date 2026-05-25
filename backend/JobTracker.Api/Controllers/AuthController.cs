using JobTracker.Api.Contracts.Auth;
using JobTracker.Domain.Entities;
using JobTracker.Infrastructure.Data;
using JobTracker.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly PasswordHasher<User> _passwordHasher;
    private readonly JwtTokenService _jwtTokenService;

    public AuthController(AppDbContext dbContext, JwtTokenService jwtTokenService)
    {
        _dbContext = dbContext;
        _jwtTokenService = jwtTokenService;
        _passwordHasher = new PasswordHasher<User>();
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLower();
        var refreshToken = _jwtTokenService.CreateRefreshToken();

        var existingUser = await _dbContext.Users.AnyAsync(x => x.Email == email);
        if (existingUser)
        {
            return BadRequest("Email is already registered.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7);
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
        
        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        return Ok(new AuthResponse {
            AccessToken = _jwtTokenService.CreateToken(user),
            RefreshToken = refreshToken,
            Email = user.Email,
            UserId = user.Id
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var email = request.Email.Trim().ToLower();
        var refreshToken = _jwtTokenService.CreateRefreshToken();

        var user = await _dbContext.Users.FirstOrDefaultAsync(x => x.Email == email);
        if (user is null)
        {
            return Unauthorized("Invalid email or password");
        }

        var result = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password
        );
        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized("Invalide email or password.");
        }

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7);

        await _dbContext.SaveChangesAsync();

        return Ok(new AuthResponse
        {
            AccessToken = _jwtTokenService.CreateToken(user),
            RefreshToken = refreshToken,
            Email = user.Email,
            UserId = user.Id
        });
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh(RefreshTokenRequest request)
    {
        var user = await _dbContext.Users
            .FirstOrDefaultAsync(x => x.RefreshToken == request.RefreshToken);
        if (user is null ||
            user.RefreshTokenExpiresAt is null ||
            user.RefreshTokenExpiresAt <= DateTime.UtcNow)
        {
            return Unauthorized("Invalid or expired refresh token.");
        }

        var newRefreshToken = _jwtTokenService.CreateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7);

        await _dbContext.SaveChangesAsync();

        return Ok(new AuthResponse
        {
            AccessToken = _jwtTokenService.CreateToken(user),
            RefreshToken = newRefreshToken,
            Email = user.Email,
            UserId = user.Id
        });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(LogoutRequest request)
    {
        var user = await _dbContext.Users
            .FirstOrDefaultAsync(x => x.RefreshToken == request.RefreshToken);
        if (user is null)
        {
            return NoContent();
        }

        user.RefreshToken = null;
        user.RefreshTokenExpiresAt = null;

        await _dbContext.SaveChangesAsync();

        return NoContent();
    }
}
