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

        public string Email { get; set; } = string.Empty;

        public Guid UserId { get; set; }
    }

    private class JobApplicationTestResponse
    {
        public Guid Id { get; set; }

        public string CompanyName { get; set; } = string.Empty;

        public string JobTitle { get; set; } = string.Empty;
    }

    private async Task<JobApplicationTestResponse> CreateJobApplicationAsync(string accessToken)
    {
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", accessToken);

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

        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<JobApplicationTestResponse>();

        return body!;
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

    [Fact]
    public async Task GetJobApplication_UserCannotReadAnotherUsersApplication()
    {
        var userAToken = await RegisterAndGetAccessTokenAsync();
        var userBToken = await RegisterAndGetAccessTokenAsync();

        var userAJob = await CreateJobApplicationAsync(userAToken);

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", userBToken);

        var respnose = await _client.GetAsync($"/api/job-applications/{userAJob.Id}");

        respnose.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdateJobApplication_UserCannotUpdateAnotherUsersApplication()
    {
        var userAToken = await RegisterAndGetAccessTokenAsync();
        var userBToken = await RegisterAndGetAccessTokenAsync();

        var userAJob = await CreateJobApplicationAsync(userAToken);

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", userBToken);

        var updateRequest = new
        {
            companyName = "Changed Company",
            jobTitle = "Changed Title",
            location = "Toronto",
            jobUrl = "https://example.com/changed",
            status = 3,
            dateApplied = DateTime.UtcNow,
            deadline = DateTime.UtcNow.AddDays(20),
            salaryRange = "$40-$50/hr",
            notes = "Trying to update another user's job." 
        };

        var response = await _client.PutAsJsonAsync(
            $"/api/job-applications/{userAJob.Id}",
            updateRequest
        );

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteJobApplication_UserCannotDeleteAnotherUsersApplication()
    {
        var userAToken = await RegisterAndGetAccessTokenAsync();
        var userBToken = await RegisterAndGetAccessTokenAsync();

        var userAJob = await CreateJobApplicationAsync(userAToken);

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", userBToken);

        var response = await _client.DeleteAsync($"/api/job-applications/{userAJob.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateJobApplication_WithInvalidInput_ShouldReturnBadRequest()
    {
        var token = await RegisterAndGetAccessTokenAsync();

            _client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", token);

        var request = new
        {
            companyName = "",
            jobTitle = "",
            location = "Vancouver",
            jobUrl = "not-a-url",
            status = 1,
            dateApplied = DateTime.UtcNow,
            deadline = DateTime.UtcNow.AddDays(14),
            salaryRange = "$30-$40/hr",
            notes = "Invalid job application."
        };

        var response = await _client.PostAsJsonAsync("/api/job-applications", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
