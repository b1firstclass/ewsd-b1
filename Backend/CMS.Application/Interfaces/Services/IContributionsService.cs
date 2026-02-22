using CMS.Application.DTOs;

namespace CMS.Application.Interfaces.Services
{
    public interface IContributionsService
    {
        Task<ContributionInfo> CreateContributionAsync(ContributionCreateRequest request);
        Task<ContributionInfo?> UpdateContributionAsync(Guid contributionId, ContributionUpdateRequest request);
        Task<ContributionInfo?> UpdateContributionStatusAsync(Guid contributionId, ContributionStatusUpdateRequest request);
        Task<ContributionFilesDownload?> DownloadContributionFilesAsync(Guid contributionId);
        Task<ContributionFilesDownload?> DownloadAllContributionFilesAsync();
    }
}
