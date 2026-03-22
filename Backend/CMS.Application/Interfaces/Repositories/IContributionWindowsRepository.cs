using CMS.Application.Common;
using CMS.Domain.Entities;

namespace CMS.Application.Interfaces.Repositories
{
    public interface IContributionWindowsRepository
    {
        Task<PagedResult<ContributionWindow>> GetPagedAsync(int skip, int take, string? searchKeyword = null, bool? isActive = null);
        Task<IReadOnlyList<ContributionWindow>> GetAllActiveAsync();
        Task<ContributionWindow?> GetByIdAsync(Guid contributionWindowId);
        Task<ContributionWindow?> GetCurrentWindowAsync(DateTime utcNow);
        Task<bool> ExistsForAcademicYearAsync(int academicYearStart, int academicYearEnd, Guid? excludeContributionWindowId = null);
        Task AddAsync(ContributionWindow contributionWindow);
        void Update(ContributionWindow contributionWindow);
    }
}
