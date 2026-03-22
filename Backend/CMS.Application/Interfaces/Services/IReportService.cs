using CMS.Application.Common;
using CMS.Application.DTOs;

namespace CMS.Application.Interfaces.Services
{
    public interface IReportService
    {
        Task<IReadOnlyList<BrowserListDto>> GetBrowserListAsync();
        Task<IReadOnlyList<ContributionCountByFacultyAcademicYearDto>> GetContributionCountByFacultyAcademicYearAsync();
        Task<IReadOnlyList<ContributionPercentageByFacultyAcademicYearDto>> GetContributionPercentageByFacultyAcademicYearAsync();
        Task<PagedResponse<ContributionsWithoutCommentDto>> GetContributionsWithoutCommentAsync(PaginationRequest paginationRequest);
        Task<PagedResponse<ContributionsWithoutCommentDto>> GetContributionsWithoutCommentAfter14DaysAsync(PaginationRequest paginationRequest);
        Task<IReadOnlyList<PageAccessCountDto>> GetPageAccessCountAsync();
        Task<IReadOnlyList<UserActivityCountDto>> GetUserActivityCountAsync();
        Task<ContributionStatusSummaryDto> GetContributionCountByStatusAsync(Guid userId);
        Task<IReadOnlyList<FacultyContributionStatusSummaryDto>> GetContributionCountByStatusPerFacultyAsync();
        Task<IReadOnlyList<FacultyUserCountDto>> GetUserCountPerFacultyAsync();
        Task<IReadOnlyList<FacultyUserCountDto>> GetStudentCountPerFacultyAsync(IReadOnlyList<Guid> facultyIds);
        Task<IReadOnlyList<TopContributorDto>> GetTopContributorsAsync(Guid? contributionWindowId);
    }
}
