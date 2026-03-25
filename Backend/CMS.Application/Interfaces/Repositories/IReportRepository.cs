using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Domain.Entities;

namespace CMS.Application.Interfaces.Repositories
{
    public interface IReportRepository
    {
        Task<IReadOnlyList<vw_BrowserList>> GetBrowserListAsync();
        Task<IReadOnlyList<vw_ContributionCountByFacultyAcademicYear>> GetContributionCountByFacultyAcademicYearAsync();
        Task<IReadOnlyList<vw_ContributionPercentageByFacultyAcademicYear>> GetContributionPercentageByFacultyAcademicYearAsync();
        Task<PagedResult<vw_ContributionsWithoutComment>> GetContributionsWithoutCommentAsync(int skip, int take);
        Task<PagedResult<vw_ContributionsWithoutCommentAfter14Day>> GetContributionsWithoutCommentAfter14DaysAsync(int skip, int take);
        Task<IReadOnlyList<vw_PageAccessCount>> GetPageAccessCountAsync();
        Task<IReadOnlyList<vw_UserActivityCount>> GetUserActivityCountAsync();
        Task<IReadOnlyList<DeviceActivityCountDto>> GetDeviceActivityCountAsync();
        Task<IReadOnlyList<ActivityCountByHourDto>> GetActivityCountByHourAsync(DateTime fromDate, DateTime toDate);
        Task<IReadOnlyList<ContributionStatusCountDto>> GetContributionCountByStatusAsync(Guid userId);
        Task<IReadOnlyList<FacultyContributionStatusRawDto>> GetContributionCountByStatusPerFacultyAsync();
        Task<IReadOnlyList<FacultyUserCountDto>> GetUserCountPerFacultyAsync();
        Task<IReadOnlyList<FacultyUserCountDto>> GetStudentCountPerFacultyAsync(IReadOnlyList<Guid> facultyIds);
        Task<IReadOnlyList<TopContributorDto>> GetTopContributorsAsync(Guid? contributionWindowId);
    }
}
