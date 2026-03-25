using CMS.Api.Utilities;
using CMS.Application.Common;
using CMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportController : ControllerBase
    {
        private readonly ILogger<ReportController> _logger;
        private readonly IReportService _reportService;
        private readonly ICurrentUserService _currentUserService;

        public ReportController(ILogger<ReportController> logger, IReportService reportService, ICurrentUserService currentUserService)
        {
            _logger = logger;
            _reportService = reportService;
            _currentUserService = currentUserService;
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [Authorize(Roles = RoleNames.Admin)]
        [HttpGet("browser-list")]
        public async Task<IActionResult> GetBrowserList()
        {
            try
            {
                var data = await _reportService.GetBrowserListAsync();
                return data.ToApiResponse(ApiResponseMessages.Retrieved("Browser list"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation failed while retrieving browser list report");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while retrieving browser list report");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving browser list report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("browser list report"), 500);
            }
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [Authorize(Roles = RoleNames.Manager)]
        [HttpGet("contribution-count-by-faculty")]
        public async Task<IActionResult> GetContributionCountByFacultyAcademicYear() //filter
        {
            try
            {
                var data = await _reportService.GetContributionCountByFacultyAcademicYearAsync();
                return data.ToApiResponse(ApiResponseMessages.Retrieved("Contribution count by faculty and academic year"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation failed while retrieving contribution count by faculty report");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while retrieving contribution count by faculty report");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contribution count by faculty report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("contribution count by faculty report"), 500);
            }
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [Authorize(Roles = RoleNames.Manager)]
        [HttpGet("contribution-percentage-by-faculty")]
        public async Task<IActionResult> GetContributionPercentageByFacultyAcademicYear() //filter window
        {
            try
            {
                var data = await _reportService.GetContributionPercentageByFacultyAcademicYearAsync();
                return data.ToApiResponse(ApiResponseMessages.Retrieved("Contribution percentage by faculty and academic year"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation failed while retrieving contribution percentage by faculty report");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while retrieving contribution percentage by faculty report");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contribution percentage by faculty report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("contribution percentage by faculty report"), 500);
            }
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [HttpGet("contributions-without-comment")]
        public async Task<IActionResult> GetContributionsWithoutComment([FromQuery] PaginationRequest? paginationRequest)
        {
            try
            {
                paginationRequest ??= new PaginationRequest();
                var data = await _reportService.GetContributionsWithoutCommentAsync(paginationRequest);
                return data.ToApiResponse(ApiResponseMessages.Retrieved("Contributions without comment"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation failed while retrieving contributions without comment report");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while retrieving contributions without comment report");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contributions without comment report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("contributions without comment report"), 500);
            }
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [HttpGet("contributions-without-comment-after-14-days")]
        public async Task<IActionResult> GetContributionsWithoutCommentAfter14Days([FromQuery] PaginationRequest? paginationRequest)
        {
            try
            {
                paginationRequest ??= new PaginationRequest();
                var data = await _reportService.GetContributionsWithoutCommentAfter14DaysAsync(paginationRequest);
                return data.ToApiResponse(ApiResponseMessages.Retrieved("Contributions without comment after 14 days"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation failed while retrieving contributions without comment after 14 days report");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while retrieving contributions without comment after 14 days report");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contributions without comment after 14 days report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("contributions without comment after 14 days report"), 500);
            }
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [Authorize(Roles = RoleNames.Admin)]
        [HttpGet("page-access-count")]
        public async Task<IActionResult> GetPageAccessCount()
        {
            try
            {
                var data = await _reportService.GetPageAccessCountAsync();
                return data.ToApiResponse(ApiResponseMessages.Retrieved("Page access count"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation failed while retrieving page access count report");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while retrieving page access count report");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving page access count report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("page access count report"), 500);
            }
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [Authorize(Roles = RoleNames.Admin)]
        [HttpGet("user-activity-count")]
        public async Task<IActionResult> GetUserActivityCount()
        {
            try
            {
                var data = await _reportService.GetUserActivityCountAsync();
                return data.ToApiResponse(ApiResponseMessages.Retrieved("User activity count"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation failed while retrieving user activity count report");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while retrieving user activity count report");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user activity count report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("user activity count report"), 500);
            }
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [Authorize(Roles = RoleNames.Admin)]
        [HttpGet("device-activity-count")]
        public async Task<IActionResult> GetDeviceActivityCount()
        {
            try
            {
                var data = await _reportService.GetDeviceActivityCountAsync();
                return data.ToApiResponse(ApiResponseMessages.Retrieved("Device activity count"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation failed while retrieving device activity count report");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while retrieving device activity count report");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving device activity count report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("device activity count report"), 500);
            }
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [Authorize(Roles = RoleNames.Admin)]
        [HttpGet("activity-count-by-hour")]
        public async Task<IActionResult> GetActivityCountByHour([FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate)
        {
            try
            {
                if (!fromDate.HasValue)
                {
                    return this.ToErrorResponse("From date is required", 400);
                }

                if (!toDate.HasValue)
                {
                    return this.ToErrorResponse("To date is required", 400);
                }

                if (fromDate.Value.Date > toDate.Value.Date)
                {
                    return this.ToErrorResponse("To date must be greater than or equal to from date", 400);
                }

                var data = await _reportService.GetActivityCountByHourAsync(fromDate.Value, toDate.Value);
                return data.ToApiResponse(ApiResponseMessages.Retrieved("Activity count by hour"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation failed while retrieving activity count by hour report");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while retrieving activity count by hour report");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving activity count by hour report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("activity count by hour report"), 500);
            }
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [Authorize(Roles = $"{RoleNames.Coordinator},{RoleNames.Student}")]
        [HttpGet("my-contribution-status-count")]
        public async Task<IActionResult> GetMyContributionStatusCount()
        {
            try
            {
                var userId = _currentUserService.UserId;
                if (!userId.HasValue)
                {
                    return this.ToErrorResponse(ApiResponseMessages.Unauthorized, 401);
                }

                var data = await _reportService.GetContributionCountByStatusAsync(userId.Value);
                return data.ToApiResponse(ApiResponseMessages.Retrieved("Contribution status count"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation failed while retrieving contribution status count report");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while retrieving contribution status count report");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contribution status count report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("contribution status count report"), 500);
            }
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [Authorize(Roles = RoleNames.Manager)]
        [HttpGet("faculty-contribution-status-count")]
        public async Task<IActionResult> GetFacultyContributionStatusCount()
        {
            try
            {
                var data = await _reportService.GetContributionCountByStatusPerFacultyAsync();
                return data.ToApiResponse(ApiResponseMessages.Retrieved("Faculty contribution status count"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation failed while retrieving faculty contribution status count report");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while retrieving faculty contribution status count report");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving faculty contribution status count report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("faculty contribution status count report"), 500);
            }
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.Manager}")]
        [HttpGet("faculty-user-count")]
        public async Task<IActionResult> GetFacultyUserCount()
        {
            try
            {
                var data = await _reportService.GetUserCountPerFacultyAsync();
                return data.ToApiResponse(ApiResponseMessages.Retrieved("Faculty user count"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation failed while retrieving faculty user count report");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while retrieving faculty user count report");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving faculty user count report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("faculty user count report"), 500);
            }
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [Authorize(Roles = RoleNames.Coordinator)]
        [HttpGet("my-faculty-student-count")]
        public async Task<IActionResult> GetMyFacultyStudentCount()
        {
            try
            {
                var facultyIds = _currentUserService.FacultyIds;
                if (facultyIds.Count == 0)
                {
                    return this.ToErrorResponse("No faculties assigned to current user", 400);
                }

                var data = await _reportService.GetStudentCountPerFacultyAsync(facultyIds);
                return data.ToApiResponse(ApiResponseMessages.Retrieved("Faculty student count"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation failed while retrieving faculty student count report");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while retrieving faculty student count report");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving faculty student count report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("faculty student count report"), 500);
            }
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [HttpGet("top-contributors")]
        public async Task<IActionResult> GetTopContributors([FromQuery] Guid? contributionWindowId)
        {
            try
            {
                if (contributionWindowId.HasValue && contributionWindowId.Value == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Contribution window"), 400);
                }

                var data = await _reportService.GetTopContributorsAsync(contributionWindowId);
                return data.ToApiResponse(ApiResponseMessages.Retrieved("Top contributors"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation failed while retrieving top contributors report");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while retrieving top contributors report");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving top contributors report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("top contributors report"), 500);
            }
        }
    }
}
