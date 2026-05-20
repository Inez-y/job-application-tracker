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

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
        
        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        return Ok(new AuthResponse {
            Token = _jwtTokenService.CreateToken(user),
            Email = user.Email,
            UserId = user.Id
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var email = request.Email.Trim().ToLower();

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

        return Ok(new AuthResponse
        {
            Token = _jwtTokenService.CreateToken(user),
            Email = user.Email,
            UserId = user.Id
        });
    }
}
