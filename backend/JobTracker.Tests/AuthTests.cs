using System.Net;
using System.Net.Http.Json;
using FluentAssertions;

namespace JobTracker.Tests;

public class AuthTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private class AuthTestResponse
    {
        public string AccessToken { get; set; } = string.Empty;

        public string RefreshToken { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public Guid UserId { get; set; }
    }

    [Fact]
    public async Task Register_ShouldReturnAccessToken()
    {
        var request = new
        {
            email = $"test-{Guid.NewGuid()}@example.com",
            password = "Password123!",
            firstName = "Test",
            lastName = "User"
        };

        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<AuthTestResponse>();

        body.Should().NotBeNull();
        body!.AccessToken.Should().NotBeNullOrWhiteSpace();
        body.RefreshToken.Should().NotBeNullOrWhiteSpace();
        body.Email.Should().Be(request.email);
    }

    [Fact]
    public async Task Register_WithInvalidInput_ShouldReturnBadRequest()
    {
        var request = new
        {
            email = "not-an-email",
            password = "123",
            firstName = "",
            lastName = ""
        };

        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Refresh_WithValidRefreshToken_ShouldReturnNewTokens()
    {
        var registerRequest = new
        {
            email = $"test-{Guid.NewGuid()}@example.com",
            password = "Password123!",
            firstName = "Test",
            lastName = "User"
        };

        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
        registerResponse.EnsureSuccessStatusCode();

        var registerBody = await registerResponse.Content.ReadFromJsonAsync<AuthTestResponse>();

        var refreshRequest = new
        {
            refreshToken = registerBody!.RefreshToken
        };

        var refreshResponse = await _client.PostAsJsonAsync("/api/auth/refresh", refreshRequest);

        refreshResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var refreshBody = await refreshResponse.Content.ReadFromJsonAsync<AuthTestResponse>();

        refreshBody.Should().NotBeNull();
        refreshBody!.AccessToken.Should().NotBeNullOrWhiteSpace();
        refreshBody.RefreshToken.Should().NotBeNullOrWhiteSpace();
        refreshBody.RefreshToken.Should().NotBe(registerBody.RefreshToken);
    }

    [Fact]
    public async Task Logout_ShouldInvalidateRefreshToken()
    {
        var registerRequest = new
        {
            email = $"test-{Guid.NewGuid()}@example.com",
            password = "Password123!",
            firstName = "Test",
            lastName = "User"
        };

        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerRequest);
        registerResponse.EnsureSuccessStatusCode();

        var registerBody = await registerResponse.Content.ReadFromJsonAsync<AuthTestResponse>();

        var logoutRequest = new
        {
            refreshToken = registerBody!.RefreshToken
        };

        var logoutResponse = await _client.PostAsJsonAsync("/api/auth/logout", logoutRequest);

        logoutResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var refreshRequest = new
        {
            refreshToken = registerBody.RefreshToken
        };

        var refreshResponse = await _client.PostAsJsonAsync("/api/auth/refresh", refreshRequest);

        refreshResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
