using FluentValidation;
using JobTracker.Api.Contracts.ApplicationNotes;

namespace JobTracker.Api.Validators;

public class CreateApplicationNoteRequestValidator : AbstractValidator<CreateApplicationNoteRequest>
{
    public CreateApplicationNoteRequestValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty()
            .MaximumLength(5000);
    }
}
