using CMS.Api.Utilities;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UAParser.Interfaces;

namespace CMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ActivityLogController : ControllerBase
    {
        private readonly ILogger<ActivityLogController> _logger;
        private readonly IActivityLogService _activityLogService;
        private readonly IUserAgentParser _parser;
        private readonly ICurrentUserService _currentUserService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ActivityLogController(
            ILogger<ActivityLogController> logger,
            IActivityLogService activityLogService,
            IHttpContextAccessor httpContextAccessor,
            IUserAgentParser parser,
            ICurrentUserService currentUserService)
        {
            _logger = logger;
            _activityLogService = activityLogService;
            _parser = parser;
            _currentUserService = currentUserService;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpPost]
        public async Task<IActionResult> LogActivity([FromBody] ActivityLogRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                if (string.IsNullOrWhiteSpace(request.Route))
                {
                    return this.ToErrorResponse("Route must not be empty or whitespace", 400);
                }

                var userId = _currentUserService.UserId;
                if (!userId.HasValue)
                {
                    return this.ToErrorResponse(ApiResponseMessages.Unauthorized, 401);
                }

                var userAgentHeader = Request.Headers["User-Agent"].ToString();
                if (string.IsNullOrWhiteSpace(userAgentHeader))
                {
                    return this.ToErrorResponse("User-Agent header is required", 400);
                }

                var clientInfo = _parser.ClientInfo;
                var context = _httpContextAccessor.HttpContext;

                var userAgentInfo = new UserAgentInfo
                {
                    Device = clientInfo.Device?.Family ?? "unknown",
                    Browser = clientInfo.Browser?.Family ?? "unknown",
                    BrowserVersion = clientInfo.Browser?.Version ?? "unknown",
                    OS = clientInfo.OS?.Family ?? "unknown",
                    OSVersion = clientInfo.OS?.Major ?? "unknown",
                    UserAgent = userAgentHeader,
                    IpAddress = context?.Connection?.RemoteIpAddress?.ToString()
                };

                await _activityLogService.LogFrontendRouteAsync(request, userAgentInfo);

                _logger.LogInformation("Frontend route logged: {Route}", request.Route);
                return this.ToSuccessResponse(ApiResponseMessages.Saved("Activity log"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Activity log validation failed");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while logging activity");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging activity");
                return this.ToErrorResponse(ApiResponseMessages.ErrorSaving("activity log"), 500);
            }
        }
    }
}
