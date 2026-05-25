using FluentValidation;
using JobTracker.Api.Contracts.JobApplications;

namespace JobTracker.Api.Validators;

public class UpdateJobApplicationRequestValidator : AbstractValidator<UpdateJobApplicationRequest>
{
    public UpdateJobApplicationRequestValidator()
    {
        RuleFor(x => x.CompanyName)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.JobTitle)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Location)
            .MaximumLength(200);

        RuleFor(x => x.JobUrl)
            .MaximumLength(1000)
            .Must(BeValidUrlOrEmpty)
            .WithMessage("JobUrl must be a valid URL.");

        RuleFor(x => x.SalaryRange)
            .MaximumLength(100);

        RuleFor(x => x.Notes)
            .MaximumLength(5000);

        RuleFor(x => x.Deadline)
            .GreaterThanOrEqualTo(DateTime.UtcNow.Date)
            .When(x => x.Deadline.HasValue)
            .WithMessage("Deadline cannot be in the past.");
    }

    private static bool BeValidUrlOrEmpty(string? url)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            return true;
        }

        return Uri.TryCreate(url, UriKind.Absolute, out var result)
            && (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
    }
}
