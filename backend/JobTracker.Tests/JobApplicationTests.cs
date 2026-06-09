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

    private class StatusHistoryTestResponse
    {
        public Guid Id { get; set; }
        public Guid JobApplicationId { get; set; }
        public int OldStatus { get; set; }
        public int NewStatus { get; set; }
        public DateTime ChangedAt { get; set; }
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

        var response = await _client.GetAsync($"/api/job-applications/{userAJob.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
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

    private async Task<List<StatusHistoryTestResponse>> GetStatusHistoryAsync(
        string accessToken,
        Guid jobApplicationId)
    {
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await _client.GetAsync(
            $"/api/job-applications/{jobApplicationId}/status-history"
        );

        response.EnsureSuccessStatusCode();

        var body = await response.Content
            .ReadFromJsonAsync<List<StatusHistoryTestResponse>>();

        return body!;
    }

    [Fact]
    public async Task UpdateStatusHistory_WithOwnerToken_ShouldReturnNoContent()
    {
        var token = await RegisterAndGetAccessTokenAsync();

        var job = await CreateJobApplicationAsync(token);

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var updateJobRequest = new
        {
            companyName = "Microsoft",
            jobTitle = "Backend Developer",
            location = "Vancouver",
            jobUrl = "https://example.com/job",
            status = 3,
            dateApplied = DateTime.UtcNow,
            deadline = DateTime.UtcNow.AddDays(14),
            salaryRange = "$30-$40/hr",
            notes = "Moved to interviewing."
        };

        var updateJobResponse = await _client.PutAsJsonAsync(
            $"/api/job-applications/{job.Id}",
            updateJobRequest
        );

        updateJobResponse.EnsureSuccessStatusCode();

        var history = await GetStatusHistoryAsync(token, job.Id);

        history.Should().NotBeEmpty();

        var historyItem = history[0];

        var updateHistoryRequest = new
        {
            oldStatus = 1,
            newStatus = 4,
            changedAt = DateTime.UtcNow
        };

        var response = await _client.PutAsJsonAsync(
            $"/api/job-applications/{job.Id}/status-history/{historyItem.Id}",
            updateHistoryRequest
        );

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }


    [Fact]
    public async Task DeleteStatusHistory_WithOwnerToken_ShouldReturnNoContent()
    {
        var token = await RegisterAndGetAccessTokenAsync();

        var job = await CreateJobApplicationAsync(token);

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var updateJobRequest = new
        {
            companyName = "Microsoft",
            jobTitle = "Backend Developer",
            location = "Vancouver",
            jobUrl = "https://example.com/job",
            status = 3,
            dateApplied = DateTime.UtcNow,
            deadline = DateTime.UtcNow.AddDays(14),
            salaryRange = "$30-$40/hr",
            notes = "Moved to interviewing."
        };

        var updateJobResponse = await _client.PutAsJsonAsync(
            $"/api/job-applications/{job.Id}",
            updateJobRequest
        );

        updateJobResponse.EnsureSuccessStatusCode();

        var history = await GetStatusHistoryAsync(token, job.Id);

        history.Should().NotBeEmpty();

        var historyItem = history[0];

        var response = await _client.DeleteAsync(
            $"/api/job-applications/{job.Id}/status-history/{historyItem.Id}"
        );

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var updatedHistory = await GetStatusHistoryAsync(token, job.Id);

        updatedHistory.Should().NotContain(x => x.Id == historyItem.Id);
    }

    [Fact]
    public async Task UpdateStatusHistory_UserCannotUpdateAnotherUsersStatusHistory()
    {
        var userAToken = await RegisterAndGetAccessTokenAsync();
        var userBToken = await RegisterAndGetAccessTokenAsync();

        var userAJob = await CreateJobApplicationAsync(userAToken);

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", userAToken);

        var updateJobRequest = new
        {
            companyName = "Microsoft",
            jobTitle = "Backend Developer",
            location = "Vancouver",
            jobUrl = "https://example.com/job",
            status = 3,
            dateApplied = DateTime.UtcNow,
            deadline = DateTime.UtcNow.AddDays(14),
            salaryRange = "$30-$40/hr",
            notes = "Moved to interviewing."
        };

        var updateJobResponse = await _client.PutAsJsonAsync(
            $"/api/job-applications/{userAJob.Id}",
            updateJobRequest
        );

        updateJobResponse.EnsureSuccessStatusCode();

        var history = await GetStatusHistoryAsync(userAToken, userAJob.Id);
        var historyItem = history[0];

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", userBToken);

        var updateHistoryRequest = new
        {
            oldStatus = 1,
            newStatus = 4,
            changedAt = DateTime.UtcNow
        };

        var response = await _client.PutAsJsonAsync(
            $"/api/job-applications/{userAJob.Id}/status-history/{historyItem.Id}",
            updateHistoryRequest
        );

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteStatusHistory_UserCannotDeleteAnotherUsersStatusHistory()
    {
        var userAToken = await RegisterAndGetAccessTokenAsync();
        var userBToken = await RegisterAndGetAccessTokenAsync();

        var userAJob = await CreateJobApplicationAsync(userAToken);

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", userAToken);

        var updateJobRequest = new
        {
            companyName = "Microsoft",
            jobTitle = "Backend Developer",
            location = "Vancouver",
            jobUrl = "https://example.com/job",
            status = 3,
            dateApplied = DateTime.UtcNow,
            deadline = DateTime.UtcNow.AddDays(14),
            salaryRange = "$30-$40/hr",
            notes = "Moved to interviewing."
        };

        var updateJobResponse = await _client.PutAsJsonAsync(
            $"/api/job-applications/{userAJob.Id}",
            updateJobRequest
        );

        updateJobResponse.EnsureSuccessStatusCode();

        var history = await GetStatusHistoryAsync(userAToken, userAJob.Id);
        var historyItem = history[0];

        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", userBToken);

        var response = await _client.DeleteAsync(
            $"/api/job-applications/{userAJob.Id}/status-history/{historyItem.Id}"
        );

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
