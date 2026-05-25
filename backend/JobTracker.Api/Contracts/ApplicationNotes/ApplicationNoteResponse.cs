namespace JobTracker.Api.Contracts.ApplicationNotes;

public class ApplicationNoteResponse
{
    public Guid Id { get; set; }

    public Guid JobApplicationId { get; set; }

    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}
