using JobTracker.Domain.Entities;

namespace JobTracker.Api.Contracts.EmailTemplates;

public class UpdateEmailTemplateRequest
{
    public string Name { get; set; } = string.Empty;
    public EmailTemplateType Type { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}
