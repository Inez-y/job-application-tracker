using JobTracker.Domain.Entities;

namespace JobTracker.Api.Contracts.Documents;

public class DocumentResponse
{
    public Guid Id { get; set; }
    public Guid JobApplicationId { get; set; }
    public string OriginalFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public DocumentType Type { get; set; }
    public DateTime UploadedAt { get; set; }
}
