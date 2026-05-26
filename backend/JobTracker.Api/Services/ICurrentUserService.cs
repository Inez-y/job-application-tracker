namespace JobTracker.Api.Services;

public interface ICurrentUserService
{
    Guid UserId { get; }
}
