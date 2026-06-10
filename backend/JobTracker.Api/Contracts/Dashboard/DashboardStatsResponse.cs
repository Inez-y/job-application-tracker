using JobTracker.Domain.Entities;

namespace JobTracker.Api.Contracts.Dashboard;

public class DashboardStatsResponse
{
    public int TotalApplications { get; set; }
    public int WishlistCount { get; set; }
    public int AppliedCount { get; set; }
    public int OnlineAssessmentCount { get; set; }
    public int InterviewingCount { get; set; }
    public int OfferCount { get; set; }
    public int RejectedCount { get; set; }
    public int WithdrawnCount { get; set; }
    public int UpcomingDeadlineCount { get; set; }
    public int CompletedReminderCount { get; set; }
    public int PendingReminderCount { get; set; }
    public List<RecentApplicationResponse> RecentApplications { get; set; } = new();
    public List<UpcomingDeadlineResponse> UpcomingDeadlines { get; set; } = new();
    public List<ApplicationTrendResponse> ApplicationTrend { get; set; } = new();
    public List<ApplicationSourceCountResponse> ApplicationSourceCounts { get; set; } = new();
}

public class RecentApplicationResponse
{
    public Guid Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public ApplicationStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpcomingDeadlineResponse
{
    public Guid Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public DateTime? Deadline { get; set; }
}

public sealed class ApplicationTrendResponse
{
    public string Month { get; set; } = string.Empty;
    public int Count { get; set; }
}
