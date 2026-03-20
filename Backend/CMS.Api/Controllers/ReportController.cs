using CMS.Api.Utilities;
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

        public ReportController(ILogger<ReportController> logger, IReportService reportService)
        {
            _logger = logger;
            _reportService = reportService;
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [HttpGet("browser-list")]
        public async Task<IActionResult> GetBrowserList()
        {
            try
            {
                var data = await _reportService.GetBrowserListAsync();
                return data.ToApiResponse(ApiResponseMessages.Retrieved("Browser list"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving browser list report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("browser list report"), 500);
            }
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [HttpGet("contribution-count-by-faculty")]
        public async Task<IActionResult> GetContributionCountByFacultyAcademicYear()
        {
            try
            {
                var data = await _reportService.GetContributionCountByFacultyAcademicYearAsync();
                return data.ToApiResponse(ApiResponseMessages.Retrieved("Contribution count by faculty and academic year"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contribution count by faculty report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("contribution count by faculty report"), 500);
            }
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [HttpGet("contribution-percentage-by-faculty")]
        public async Task<IActionResult> GetContributionPercentageByFacultyAcademicYear()
        {
            try
            {
                var data = await _reportService.GetContributionPercentageByFacultyAcademicYearAsync();
                return data.ToApiResponse(ApiResponseMessages.Retrieved("Contribution percentage by faculty and academic year"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contribution percentage by faculty report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("contribution percentage by faculty report"), 500);
            }
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [HttpGet("contributions-without-comment")]
        public async Task<IActionResult> GetContributionsWithoutComment()
        {
            try
            {
                var data = await _reportService.GetContributionsWithoutCommentAsync();
                return data.ToApiResponse(ApiResponseMessages.Retrieved("Contributions without comment"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contributions without comment report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("contributions without comment report"), 500);
            }
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [HttpGet("contributions-without-comment-after-14-days")]
        public async Task<IActionResult> GetContributionsWithoutCommentAfter14Days()
        {
            try
            {
                var data = await _reportService.GetContributionsWithoutCommentAfter14DaysAsync();
                return data.ToApiResponse(ApiResponseMessages.Retrieved("Contributions without comment after 14 days"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contributions without comment after 14 days report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("contributions without comment after 14 days report"), 500);
            }
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [HttpGet("page-access-count")]
        public async Task<IActionResult> GetPageAccessCount()
        {
            try
            {
                var data = await _reportService.GetPageAccessCountAsync();
                return data.ToApiResponse(ApiResponseMessages.Retrieved("Page access count"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving page access count report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("page access count report"), 500);
            }
        }

        //[HasPermission(PermissionNames.ReportRead)]
        [HttpGet("user-activity-count")]
        public async Task<IActionResult> GetUserActivityCount()
        {
            try
            {
                var data = await _reportService.GetUserActivityCountAsync();
                return data.ToApiResponse(ApiResponseMessages.Retrieved("User activity count"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user activity count report");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("user activity count report"), 500);
            }
        }
    }
}
