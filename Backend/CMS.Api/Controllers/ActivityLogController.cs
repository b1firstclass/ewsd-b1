using CMS.Api.Utilities;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Threading.Tasks;
using UAParser;
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
                    return BadRequest(ModelState);
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
                    UserAgent = Request.Headers["User-Agent"].ToString(),
                    IpAddress = context?.Connection?.RemoteIpAddress?.ToString()
                };

                await _activityLogService.LogFrontendRouteAsync(request, userAgentInfo);

                _logger.LogInformation($"Frontend route logged: {request.Route}");
                return this.ToSuccessResponse("Activitylog saved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging activity");
                return this.ToErrorResponse("An error occurred while saving the activity log", 500);
            }
        }
    }
}
