using CMS.Application.Common;
using CMS.Application.DTOs;

namespace CMS.Application.Interfaces.Services
{
    public interface IContributionWindowsService
    {
        Task<PagedResponse<ContributionWindowInfo>> GetAllContributionWindowsAsync(PaginationRequest paginationRequest);
        Task<ContributionWindowInfo?> GetContributionWindowByIdAsync(Guid contributionWindowId);
        Task<ContributionWindowInfo> CreateContributionWindowAsync(ContributionWindowCreateRequest request);
        Task<ContributionWindowInfo?> UpdateContributionWindowAsync(Guid contributionWindowId, ContributionWindowUpdateRequest request);
        Task<bool> DeleteContributionWindowAsync(Guid contributionWindowId);
    }
}
