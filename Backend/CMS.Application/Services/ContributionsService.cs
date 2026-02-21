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
        private const long MaxDocumentFileSizeBytes = 10 * 1024 * 1024;
        private const long MaxImageFileSizeBytes = 5 * 1024 * 1024;

        private static readonly HashSet<string> AllowedDocumentExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".doc",
            ".docx"
        };

        private static readonly HashSet<string> AllowedImageExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".webp"
        };

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

            var contributionWindow = await _unitOfWork.ContributionWindowsRepository.GetByIdAsync(request.ContributionWindowId);
            if (contributionWindow == null)
            {
                throw new InvalidOperationException("Contribution window not found");
            }

            ContributionFileValidator.ValidateFile(request.DocumentFile, AllowedDocumentExtensions, MaxDocumentFileSizeBytes, "Document");

            if (request.ImageFile != null)
            {
                ContributionFileValidator.ValidateFile(request.ImageFile, AllowedImageExtensions, MaxImageFileSizeBytes, "Image");
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
                Status = "Draft",
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

            if (contribution.CreatedBy != currentUserId)
            {
                throw new UnauthorizedAccessException("Forbidden");
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
                ContributionFileValidator.ValidateFile(request.DocumentFile, AllowedDocumentExtensions, MaxDocumentFileSizeBytes, "Document");
                DisableDocuments(contribution, AllowedDocumentExtensions, currentUserId);
                contribution.Documents.Add(CreateDocument(request.DocumentFile, contribution.ContributionId, currentUserId, DateTime.UtcNow));
            }

            if (request.ImageFile != null)
            {
                ContributionFileValidator.ValidateFile(request.ImageFile, AllowedImageExtensions, MaxImageFileSizeBytes, "Image");
                DisableDocuments(contribution, AllowedImageExtensions, currentUserId);
                contribution.Documents.Add(CreateDocument(request.ImageFile, contribution.ContributionId, currentUserId, DateTime.UtcNow));
            }

            contribution.ModifiedDate = DateTime.UtcNow;
            contribution.ModifiedBy = currentUserId;

            _unitOfWork.ContributionsRepository.Update(contribution);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Contribution updated: {ContributionId}", contribution.ContributionId);

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
    }
}
