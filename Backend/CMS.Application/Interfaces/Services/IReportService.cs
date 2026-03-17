using CMS.Application.DTOs;

namespace CMS.Application.Interfaces.Services
{
    public interface IReportService
    {
        Task<IReadOnlyList<BrowserListDto>> GetBrowserListAsync();
        Task<IReadOnlyList<ContributionCountByFacultyAcademicYearDto>> GetContributionCountByFacultyAcademicYearAsync();
        Task<IReadOnlyList<ContributionPercentageByFacultyAcademicYearDto>> GetContributionPercentageByFacultyAcademicYearAsync();
        Task<IReadOnlyList<ContributionsWithoutCommentDto>> GetContributionsWithoutCommentAsync();
        Task<IReadOnlyList<ContributionsWithoutCommentDto>> GetContributionsWithoutCommentAfter14DaysAsync();
        Task<IReadOnlyList<PageAccessCountDto>> GetPageAccessCountAsync();
        Task<IReadOnlyList<UserActivityCountDto>> GetUserActivityCountAsync();
    }
}
