using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Repositories;
using CMS.Application.Interfaces.Services;
using CMS.Application.Utilities;
using CMS.Domain.Entities;
using Microsoft.Extensions.Logging;
using System.IO;
using System.IO.Compression;

namespace CMS.Application.Services
{
    public class ContributionsService : IContributionsService
    {
        private readonly ILogger<ContributionsService> _logger;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public ContributionsService(
            ILogger<ContributionsService> logger,
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService)
        {
            _logger = logger;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<ContributionInfo> CreateContributionAsync(ContributionCreateRequest request)
        {
            var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Unauthorized");
            var currentUser = await _unitOfWork.UsersRepository.GetByUserIdAsync(currentUserId);
            if (currentUser == null)
            {
                throw new UnauthorizedAccessException("Unauthorized");
            }

            if (!IsInRole(currentUser, ContributionConstants.RoleStudent))
            {
                throw new UnauthorizedAccessException("Forbidden");
            }

            var contributionWindow = await _unitOfWork.ContributionWindowsRepository.GetByIdAsync(request.ContributionWindowId);
            if (contributionWindow == null)
            {
                throw new InvalidOperationException("Contribution window not found");
            }

            ContributionFileValidator.ValidateFile(
                request.DocumentFile,
                ContributionConstants.AllowedDocumentExtensions,
                ContributionConstants.MaxDocumentFileSizeBytes,
                "Document");

            if (request.ImageFile != null)
            {
                ContributionFileValidator.ValidateFile(
                    request.ImageFile,
                    ContributionConstants.AllowedImageExtensions,
                    ContributionConstants.MaxImageFileSizeBytes,
                    "Image");
            }

            var now = DateTime.UtcNow;
            var contribution = new Contribution
            {
                ContributionId = Guid.NewGuid(),
                ContributionWindowId = request.ContributionWindowId,
                UserId = currentUserId,
                Subject = request.Subject.Trim(),
                Description = request.Description.Trim(),
                Rating = 0,
                Status = ContributionConstants.StatusDraft,
                IsActive = true,
                CreatedDate = now,
                CreatedBy = currentUserId
            };

            contribution.Documents.Add(CreateDocument(request.DocumentFile, contribution.ContributionId, currentUserId, now));

            if (request.ImageFile != null)
            {
                contribution.Documents.Add(CreateDocument(request.ImageFile, contribution.ContributionId, currentUserId, now));
            }

            await _unitOfWork.ContributionsRepository.AddAsync(contribution);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Contribution created: {ContributionId}", contribution.ContributionId);

            return MapContributionInfo(contribution);
        }

        public async Task<ContributionFilesDownload?> DownloadAllContributionFilesAsync()
        {
            _ = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Unauthorized");

            var contributions = await _unitOfWork.ContributionsRepository.GetAllWithDocumentsAsync();
            if (contributions.Count == 0)
            {
                _logger.LogWarning("No contributions found for file download");
                return null;
            }

            using var stream = new MemoryStream();
            using (var archive = new ZipArchive(stream, ZipArchiveMode.Create, true))
            {
                foreach (var contribution in contributions)
                {
                    AddContributionDocumentsToArchive(archive, contribution);
                }
            }

            var data = stream.ToArray();
            if (data.Length == 0)
            {
                _logger.LogWarning("No active contribution files found for download");
                return null;
            }

            return new ContributionFilesDownload
            {
                Data = data,
                FileName = "contributions-files.zip",
                ContentType = "application/zip"
            };
        }

        public async Task<ContributionFilesDownload?> DownloadContributionFilesAsync(Guid contributionId)
        {
            if (contributionId == Guid.Empty)
            {
                return null;
            }

            var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Unauthorized");
            var contribution = await _unitOfWork.ContributionsRepository.GetByIdWithDocumentsAsync(contributionId);
            if (contribution == null)
            {
                _logger.LogWarning("Contribution not found for file download: {ContributionId}", contributionId);
                return null;
            }

            if (contribution.UserId != currentUserId)
            {
                throw new UnauthorizedAccessException("Forbidden");
            }

            if (!string.Equals(contribution.Status, ContributionConstants.StatusDraft, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Only draft contributions can be updated.");
            }

            var activeDocuments = contribution.Documents
                .Where(document => document.IsActive && document.Data != null && document.Data.Length > 0)
                .ToList();

            if (activeDocuments.Count == 0)
            {
                _logger.LogWarning("No active files found for contribution {ContributionId}", contributionId);
                return null;
            }

            using var stream = new MemoryStream();
            using (var archive = new ZipArchive(stream, ZipArchiveMode.Create, true))
            {
                foreach (var document in activeDocuments)
                {
                    var entryName = string.IsNullOrWhiteSpace(document.FileName)
                        ? $"{document.DocumentId}{document.Extension}"
                        : document.FileName;
                    var entry = archive.CreateEntry(entryName, CompressionLevel.Fastest);
                    using var entryStream = entry.Open();
                    entryStream.Write(document.Data!);
                }
            }

            return new ContributionFilesDownload
            {
                Data = stream.ToArray(),
                FileName = $"contribution-{contributionId}-files.zip",
                ContentType = "application/zip"
            };
        }

        private static void AddContributionDocumentsToArchive(ZipArchive archive, Contribution contribution)
        {
            var folderName = $"contribution-{contribution.ContributionId}";
            var documents = contribution.Documents
                .Where(document => document.IsActive && document.Data != null && document.Data.Length > 0)
                .ToList();

            foreach (var document in documents)
            {
                var entryName = string.IsNullOrWhiteSpace(document.FileName)
                    ? $"{document.DocumentId}{document.Extension}"
                    : document.FileName;
                var entry = archive.CreateEntry($"{folderName}/{entryName}", CompressionLevel.Fastest);
                using var entryStream = entry.Open();
                entryStream.Write(document.Data!);
            }
        }

        public async Task<ContributionInfo?> UpdateContributionAsync(Guid contributionId, ContributionUpdateRequest request)
        {
            if (contributionId == Guid.Empty)
            {
                return null;
            }

            var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Unauthorized");

            var contribution = await _unitOfWork.ContributionsRepository.GetByIdWithDocumentsAsync(contributionId);
            if (contribution == null)
            {
                _logger.LogWarning("Contribution not found for update: {ContributionId}", contributionId);
                return null;
            }

            if (contribution.CreatedBy != currentUserId)
            {
                throw new UnauthorizedAccessException("Forbidden");
            }

            if (!string.IsNullOrWhiteSpace(request.Subject))
            {
                contribution.Subject = request.Subject.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.Description))
            {
                contribution.Description = request.Description.Trim();
            }

            if (request.DocumentFile != null)
            {
                ContributionFileValidator.ValidateFile(
                    request.DocumentFile,
                    ContributionConstants.AllowedDocumentExtensions,
                    ContributionConstants.MaxDocumentFileSizeBytes,
                    "Document");
                DisableDocuments(contribution, ContributionConstants.AllowedDocumentExtensions, currentUserId);
                contribution.Documents.Add(CreateDocument(request.DocumentFile, contribution.ContributionId, currentUserId, DateTime.UtcNow));
            }

            if (request.ImageFile != null)
            {
                ContributionFileValidator.ValidateFile(
                    request.ImageFile,
                    ContributionConstants.AllowedImageExtensions,
                    ContributionConstants.MaxImageFileSizeBytes,
                    "Image");
                DisableDocuments(contribution, ContributionConstants.AllowedImageExtensions, currentUserId);
                contribution.Documents.Add(CreateDocument(request.ImageFile, contribution.ContributionId, currentUserId, DateTime.UtcNow));
            }

            contribution.ModifiedDate = DateTime.UtcNow;
            contribution.ModifiedBy = currentUserId;

            _unitOfWork.ContributionsRepository.Update(contribution);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Contribution updated: {ContributionId}", contribution.ContributionId);

            return MapContributionInfo(contribution);
        }

        public async Task<ContributionInfo?> UpdateContributionStatusAsync(Guid contributionId, ContributionStatusUpdateRequest request)
        {
            if (contributionId == Guid.Empty)
            {
                return null;
            }

            var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Unauthorized");
            var contribution = await _unitOfWork.ContributionsRepository.GetByIdAsync(contributionId);
            if (contribution == null)
            {
                _logger.LogWarning("Contribution not found for status update: {ContributionId}", contributionId);
                return null;
            }

            var targetStatus = NormalizeStatus(request.Status);
            if (string.Equals(targetStatus, ContributionConstants.StatusDraft, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Status change to Draft is not supported.");
            }

            var currentUser = await _unitOfWork.UsersRepository.GetByUserIdAsync(currentUserId);
            if (currentUser == null)
            {
                throw new UnauthorizedAccessException("Unauthorized");
            }

            if (string.Equals(targetStatus, ContributionConstants.StatusSubmitted, StringComparison.OrdinalIgnoreCase))
            {
                await ValidateStudentSubmissionAsync(contribution, currentUser);
            }
            else
            {
                await ValidateCoordinatorReviewAsync(contribution, currentUser, targetStatus);
            }

            var now = DateTime.UtcNow;
            contribution.Status = targetStatus;
            contribution.ModifiedDate = now;
            contribution.ModifiedBy = currentUserId;

            if (string.Equals(targetStatus, ContributionConstants.StatusSubmitted, StringComparison.OrdinalIgnoreCase))
            {
                contribution.SubmittedDate = now;
                contribution.SubmittedBy = currentUserId;
            }
            else if (string.Equals(targetStatus, ContributionConstants.StatusApproved, StringComparison.OrdinalIgnoreCase) ||
                     string.Equals(targetStatus, ContributionConstants.StatusRejected, StringComparison.OrdinalIgnoreCase))
            {
                contribution.ReviewedDate = now;
                contribution.ReviewedBy = currentUserId;
            }

            _unitOfWork.ContributionsRepository.Update(contribution);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Contribution status updated: {ContributionId} -> {Status}", contributionId, targetStatus);

            return MapContributionInfo(contribution);
        }

        private static void DisableDocuments(Contribution contribution, HashSet<string> extensions, Guid currentUserId)
        {
            var documentsToDisable = contribution.Documents
                .Where(document => document.IsActive && extensions.Contains(document.Extension))
                .ToList();

            foreach (var document in documentsToDisable)
            {
                document.IsActive = false;
                document.ModifiedDate = DateTime.UtcNow;
                document.ModifiedBy = currentUserId;
            }
        }

        private static Document CreateDocument(ContributionFileRequest file, Guid contributionId, Guid currentUserId, DateTime now)
        {
            var extension = Path.GetExtension(file.FileName);
            var storedFileName = $"{Guid.NewGuid()}{extension}";

            return new Document
            {
                DocumentId = Guid.NewGuid(),
                ContributionId = contributionId,
                FileName = storedFileName,
                Extension = extension,
                Size = Convert.ToInt32(file.Size),
                Data = file.Data,
                IsActive = true,
                CreatedDate = now,
                CreatedBy = currentUserId
            };
        }

        private static ContributionInfo MapContributionInfo(Contribution contribution)
        {
            return new ContributionInfo
            {
                Id = contribution.ContributionId,
                ContributionWindowId = contribution.ContributionWindowId,
                Subject = contribution.Subject,
                Description = contribution.Description,
                Status = contribution.Status,
                CreatedDate = contribution.CreatedDate,
                ModifiedDate = contribution.ModifiedDate
            };
        }

        private static string NormalizeStatus(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                throw new ArgumentException("Status is required");
            }

            if (!ContributionConstants.StatusMap.TryGetValue(status.Trim(), out var normalized))
            {
                throw new InvalidOperationException($"Status '{status}' is not supported.");
            }

            return normalized;
        }

        private async Task ValidateStudentSubmissionAsync(Contribution contribution, User currentUser)
        {
            if (!IsInRole(currentUser, ContributionConstants.RoleStudent))
            {
                throw new UnauthorizedAccessException("Forbidden");
            }

            if (contribution.UserId != currentUser.UserId)
            {
                throw new UnauthorizedAccessException("Forbidden");
            }

            if (!string.Equals(contribution.Status, ContributionConstants.StatusDraft, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Only draft contributions can be submitted.");
            }

            var facultyIds = currentUser.Faculties.Select(faculty => faculty.FacultyId).ToList();
            if (facultyIds.Count == 0)
            {
                throw new InvalidOperationException("User is not assigned to a faculty.");
            }

            var coordinatorExists = await _unitOfWork.UsersRepository.ExistsUserInRoleWithFacultiesAsync(
                ContributionConstants.RoleCoordinator,
                facultyIds,
                currentUser.UserId);
            if (!coordinatorExists)
            {
                throw new InvalidOperationException("No coordinator found for the user's faculty.");
            }
        }

        private async Task ValidateCoordinatorReviewAsync(Contribution contribution, User currentUser, string targetStatus)
        {
            if (!IsInRole(currentUser, ContributionConstants.RoleCoordinator))
            {
                throw new UnauthorizedAccessException("Forbidden");
            }

            if (!string.Equals(contribution.Status, ContributionConstants.StatusSubmitted, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Only submitted contributions can be reviewed.");
            }

            if (!string.Equals(targetStatus, ContributionConstants.StatusApproved, StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(targetStatus, ContributionConstants.StatusRejected, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Only Approved or Rejected statuses are allowed for review.");
            }

            var owner = await _unitOfWork.UsersRepository.GetByUserIdAsync(contribution.UserId);
            if (owner == null)
            {
                throw new InvalidOperationException("Contribution owner not found.");
            }

            var sharesFaculty = currentUser.Faculties.Any(faculty => owner.Faculties.Any(ownerFaculty => ownerFaculty.FacultyId == faculty.FacultyId));
            if (!sharesFaculty)
            {
                throw new UnauthorizedAccessException("Forbidden");
            }
        }

        private static bool IsInRole(User user, string roleName)
        {
            return user.Roles.Any(role => string.Equals(role.Name, roleName, StringComparison.OrdinalIgnoreCase));
        }
    }
}
