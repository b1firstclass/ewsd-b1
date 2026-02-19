using CMS.Application.Interfaces.Services;
using CMS.Domain.Entities;
using CMS.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using UAParser.Interfaces;

namespace CMS.Api.Middleware
{
    public class UserActivityLoggingMiddleware
    {
        private const string EventTypeRequest = "API_REQUEST";

        private readonly RequestDelegate _next;
        private readonly ILogger<UserActivityLoggingMiddleware> _logger;

        public UserActivityLoggingMiddleware(RequestDelegate next, ILogger<UserActivityLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(
            HttpContext context,
            AppDbContext dbContext,
            ICurrentUserService currentUserService,
            IUserAgentParser parser)
        {
            var stopwatch = Stopwatch.StartNew();

            var clientInfo = parser.ClientInfo;
            var device = clientInfo.Device?.Family ?? "unknown";
            var browser = clientInfo.Browser?.Family ?? "unknown";
            var browserVersion = clientInfo.Browser?.Version ?? "unknown";
            var os = clientInfo.OS?.Family ?? "unknown";
            var osVersion = clientInfo.OS?.Major ?? "unknown";

            var resourcePath = context.Request.Path.HasValue ? context.Request.Path.Value : "/";
            var logEntry = new UserActivityLog
            {
                ActivityId = Guid.NewGuid(),
                UserId = currentUserService.UserId,
                EventType = EventTypeRequest,
                Resource = Truncate(resourcePath, 200) ?? "/",
                HttpMethod = Truncate(context.Request.Method, 50),
                LoggedDate = DateTime.UtcNow,
                IpAddress = Truncate(context.Connection.RemoteIpAddress?.ToString(), 100),
                UserAgent = Truncate(GetUserAgent(context), 500),
                Device = Truncate(device, 100),
                Browser = Truncate(browser, 100),
                BrowserVersion = Truncate(browserVersion, 50),
                OS = Truncate(os, 50),
                OsVersion = Truncate(osVersion, 50)
            };

            try
            {
                await _next(context);
                logEntry.StatusCode = context.Response.StatusCode.ToString();
            }
            catch (Exception)
            {
                logEntry.StatusCode = StatusCodes.Status500InternalServerError.ToString();
                throw;
            }
            finally
            {
                stopwatch.Stop();
                logEntry.DurationMs = (int)Math.Min(stopwatch.ElapsedMilliseconds, int.MaxValue);

                try
                {
                    await dbContext.UserActivityLogs.AddAsync(logEntry);
                    await dbContext.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Unable to persist user activity log for {Resource}", logEntry.Resource);
                }
            }
        }

        private static string? GetUserAgent(HttpContext context)
        {
            if (context.Request.Headers.TryGetValue("User-Agent", out var headerValues))
            {
                return headerValues.ToString();
            }

            return null;
        }

        private static string? Truncate(string? value, int maxLength)
        {
            if (string.IsNullOrEmpty(value))
            {
                return value;
            }

            return value.Length <= maxLength ? value : value.Substring(0, maxLength);
        }
    }
}
