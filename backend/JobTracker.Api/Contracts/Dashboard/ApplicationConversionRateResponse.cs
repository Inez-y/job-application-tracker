using JobTracker.Domain.Entities;

namespace JobTracker.Api.Contracts.Dashboard;

public sealed class ApplicationConversionRateResponse
{
    public ApplicationStatus FromStatus { get; set; }
    public ApplicationStatus ToStatus { get; set; }
    public string Label { get; set; } = string.Empty;
    public int FromCount { get; set; }
    public int ToCount { get; set; }
    public decimal Rate { get; set; }
}
