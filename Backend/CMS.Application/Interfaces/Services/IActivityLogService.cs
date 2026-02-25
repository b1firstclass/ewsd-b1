using CMS.Application.Common;
using CMS.Application.DTOs;

namespace CMS.Application.Interfaces.Services
{
    public interface IActivityLogService
    {
        Task LogFrontendRouteAsync(ActivityLogRequest request, UserAgentInfo userAgentInfo);
    }
}
