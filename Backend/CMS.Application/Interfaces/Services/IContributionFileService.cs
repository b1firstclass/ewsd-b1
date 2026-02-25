using CMS.Application.DTOs;
using CMS.Domain.Entities;

namespace CMS.Application.Interfaces.Services
{
    public interface IContributionFileService
    {
        void ValidateDocumentFile(ContributionFileRequest file);
        void ValidateImageFile(ContributionFileRequest? file);
        Document CreateDocument(ContributionFileRequest file, Guid contributionId, Guid currentUserId);
        void DisableDocumentsOfType(Contribution contribution, HashSet<string> extensions, Guid currentUserId);
        ContributionFilesDownload? CreateZipArchive(IReadOnlyList<Contribution> contributions);
        ContributionFilesDownload? CreateZipArchiveForSingleContribution(Contribution contribution);
    }
}
