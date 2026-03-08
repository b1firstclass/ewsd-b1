using CMS.Application.DTOs;
using CMS.Application.Common;

namespace CMS.Application.Interfaces.Services
{
    public interface IContributionsService
    {
        Task<ContributionInfo> CreateContributionAsync(ContributionCreateRequest request);
        Task<PagedResponse<ContributionInfo>> GetMyContributionsAsync(PaginationRequest paginationRequest, string? status = null);
        Task<ContributionDetailInfo?> GetContributionByIdAsync(Guid contributionId);
        Task<ContributionInfo?> UpdateContributionAsync(Guid contributionId, ContributionUpdateRequest request);
        Task<ContributionInfo?> SubmitContributionAsync(Guid contributionId);
        Task<ContributionInfo?> ReviewedContributionAsync(Guid contributionId);
        Task<ContributionInfo?> ApprovedContributionAsync(Guid contributionId);
        Task<ContributionInfo?> RejectedContributionAsync(Guid contributionId);
        Task<ContributionInfo?> RequestRevisionContributionAsync(Guid contributionId);
        Task<ContributionInfo?> UpdateContributionStatusAsync(Guid contributionId, string status);
        Task<ContributionFilesDownload?> DownloadContributionFilesAsync(Guid contributionId);
        Task<ContributionFilesDownload?> DownloadAllContributionFilesAsync();
    }
}
