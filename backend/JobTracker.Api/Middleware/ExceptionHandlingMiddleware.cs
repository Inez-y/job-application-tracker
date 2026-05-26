using System.Net;
using System.Text.Json;
using JobTracker.Api.Contracts.Common;

namespace JobTracker.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    private static async Task WriteErrorResponseAsync(
        HttpContext context,
        HttpStatusCode statusCode,
        string message)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = new ErrorResponse
        {
            StatusCode = (int)statusCode,
            Message = message
        };

        var json = JsonSerializer.Serialize(response);

        await context.Response.WriteAsync(json);
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access.");

            await WriteErrorResponseAsync(
                context,
                HttpStatusCode.Unauthorized,
                "Unauthorized."
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occured.");

            var message = _environment.IsDevelopment() 
                ? ex.Message 
                : "An unexpected error occured.";

            await WriteErrorResponseAsync(
                context,
                HttpStatusCode.InternalServerError,
                message
            );
        }
    }
}