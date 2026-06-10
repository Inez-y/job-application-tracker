namespace JobTracker.Api.Contracts.Calendar;

public sealed class CalendarEventResponse
{
    public Guid Id { get; set; }
    public Guid JobApplicationId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public DateTime StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }
    public string Type { get; set; } = string.Empty;
}
