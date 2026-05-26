using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;

namespace JobTracker.Tests;

public class JobApplicationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public JobApplicationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private class AuthTestResponse
    {
        public string AccessToken { get; set; } = string.Empty;

        public string RefreshToken { get; set; } = string.Empty;
    }

    [Fact]
    public async Task GetJobApplications_WithoutToken_ShouldReturnUnauthorized()
    {
        var response = await _client.GetAsync("/api/job-applications");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateJobApplication_WithToken_ShouldReturnCreated()
    {
        var token = await RegisterAndGetAccessTokenAsync();

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var request = new
        {
            companyName = "Microsoft",
            jobTitle = "Backend Developer",
            location = "Vancouver",
            jobUrl = "https://example.com/job",
            status = 1,
            dateApplied = DateTime.UtcNow,
            deadline = DateTime.UtcNow.AddDays(14),
            salaryRange = "$30-$40/hr",
            notes = "Applied through careers page."
        };

        var response = await _client.PostAsJsonAsync("/api/job-applications", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    private async Task<string> RegisterAndGetAccessTokenAsync()
    {
        var request = new
        {
            email = $"test-{Guid.NewGuid()}@example.com",
            password = "Password123!",
            firstName = "Test",
            lastName = "User"
        };

        var response = await _client.PostAsJsonAsync("/api/auth/register", request);
        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<AuthTestResponse>();

        return body!.AccessToken;
    }
}