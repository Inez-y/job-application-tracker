namespace JobTracker.Domain.Entities;

public class JobApplication
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public User? User { get; set; }

    public Guid UserId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string JobTitle { get; set; } = string.Empty;

    public string? Location { get; set; }

    public string? JobUrl { get; set; }

    public ApplicationStatus Status { get; set; } = ApplicationStatus.Wishlist;
    public List<ApplicationNote> ApplicationNotes { get; set; } = new();
    public List<ApplicationStatusHistory> StatusHistory { get; set; } = new();

    public DateTime? DateApplied { get; set; }

    public DateTime? Deadline { get; set; }

    public string? SalaryRange { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<Interview> Interviews { get; set; } = new();
}
