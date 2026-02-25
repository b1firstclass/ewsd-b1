using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Repositories;
using CMS.Application.Interfaces.Services;
using CMS.Domain.Entities;

namespace CMS.Application.Services
{
    public class ActivityLogService : IActivityLogService
    {
        private readonly IActivityLogRepository _activityLogRepository;
        private readonly ICurrentUserService _currentUserService;

        public ActivityLogService(IActivityLogRepository activityLogRepository, ICurrentUserService currentUserService)
        {
            _activityLogRepository = activityLogRepository;
            _currentUserService = currentUserService;
        }

        public async Task LogFrontendRouteAsync(ActivityLogRequest request, UserAgentInfo userAgentInfo)
        {

            var log = new UserActivityLog
            {
                ActivityId = Guid.NewGuid(),
                UserId = _currentUserService.UserId,
                EventType = "FRONTEND_ROUTE",
                Resource = request.Route,
                LoggedDate = DateTime.UtcNow,
                UserAgent = userAgentInfo.UserAgent,
                Browser = userAgentInfo.Browser,
                BrowserVersion = userAgentInfo.BrowserVersion,
                OS = userAgentInfo.OS,
                OsVersion = userAgentInfo.OSVersion,
                Device = userAgentInfo.Device,
                IpAddress = userAgentInfo.IpAddress
            };

            await _activityLogRepository.AddAsync(log);
        }
    }
}
