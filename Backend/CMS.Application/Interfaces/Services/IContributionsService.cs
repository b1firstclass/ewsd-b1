using CMS.Application.Common;
using CMS.Application.DTOs;

namespace CMS.Application.Interfaces.Services
{
    public interface IContributionsService
    {
        Task<ContributionInfo> CreateContributionAsync(ContributionCreateRequest request);
        Task<PagedResponse<ContributionInfo>> GetMyContributionsAsync(PaginationRequest paginationRequest, string? status = null);
        Task<PagedResponse<ContributionInfo>> GetSelectedContributionsForFacultyViewerAsync(PaginationRequest paginationRequest, Guid? contributionWindowId = null);
        Task<ContributionDetailInfo?> GetContributionByIdAsync(Guid contributionId);
        Task<ContributionInfo?> UpdateContributionAsync(Guid contributionId, ContributionUpdateRequest request);
        Task<ContributionInfo?> SubmitContributionAsync(Guid contributionId);
        Task<ContributionInfo?> ReviewedContributionAsync(Guid contributionId);
        Task<ContributionInfo?> ApprovedContributionAsync(Guid contributionId);
        Task<ContributionInfo?> SelectedContributionAsync(Guid contributionId);
        Task<IReadOnlyList<ContributionInfo>> SelectedContributionsAsync(IReadOnlyCollection<Guid> contributionIds);
        Task<ContributionInfo?> RejectedContributionAsync(Guid contributionId);
        Task<ContributionInfo?> RequestRevisionContributionAsync(Guid contributionId);
        Task<ContributionInfo?> RateContributionAsync(Guid contributionId, int rating);
        Task<ContributionInfo?> UpdateContributionStatusAsync(Guid contributionId, string status);
        Task<ContributionFilesDownload?> DownloadContributionFilesAsync(Guid contributionId);
        Task<ContributionFileDownload?> DownloadDocumentByIdAsync(Guid documentId);
        Task<ContributionFilesDownload?> DownloadSelectedContributionFilesForManagerAsync(Guid contributionId);
        Task<ContributionFilesDownload?> DownloadSelectedContributionsFilesForManagerAsync(IReadOnlyCollection<Guid> contributionIds);
        Task<ContributionFilesDownload?> DownloadAllContributionFilesAsync();
    }
}
