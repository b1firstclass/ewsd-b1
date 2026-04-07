using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Services;
using CMS.Application.Utilities;
using CMS.Domain.Entities;
using System.IO.Compression;

namespace CMS.Application.Services
{

    public class ContributionFileService : IContributionFileService
    {
        public void ValidateDocumentFile(ContributionFileRequest file)
        {
            ContributionFileValidator.ValidateFile(
                file,
                ContributionConstants.AllowedDocumentExtensions,
                ContributionConstants.MaxDocumentFileSizeBytes,
                "Document");
        }

        public void ValidateImageFile(ContributionFileRequest? file)
        {
            if (file == null) return;

            ContributionFileValidator.ValidateFile(
                file,
                ContributionConstants.AllowedImageExtensions,
                ContributionConstants.MaxImageFileSizeBytes,
                "Image");
        }

        public Document CreateDocument(ContributionFileRequest file, Guid contributionId, Guid currentUserId)
        {
            var extension = Path.GetExtension(file.FileName);
            var now = DateTime.UtcNow;

            return new Document
            {
                DocumentId = Guid.NewGuid(),
                ContributionId = contributionId,
                FileName = file.FileName,
                Extension = extension,
                Size = Convert.ToInt32(file.Size),
                Data = file.Data,
                IsActive = true,
                CreatedDate = now,
                CreatedBy = currentUserId
            };
        }

        public void RemoveDocumentsOfType(Contribution contribution, HashSet<string> extensions)
        {
            var documentsToRemove = contribution.Documents
                .Where(document => document.IsActive && extensions.Contains(document.Extension))
                .ToList();

            foreach (var document in documentsToRemove)
            {
                contribution.Documents.Remove(document);
            }
        }

        public ContributionFilesDownload? CreateZipArchive(IReadOnlyList<Contribution> contributions)
        {
            if (contributions.Count == 0)
            {
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
                return null;
            }

            return new ContributionFilesDownload
            {
                Data = data,
                FileName = "contributions-files.zip",
                ContentType = "application/zip"
            };
        }

        public ContributionFilesDownload? CreateZipArchiveForSingleContribution(Contribution contribution)
        {
            var activeDocuments = GetActiveDocuments(contribution);
            if (activeDocuments.Count == 0)
            {
                return null;
            }

            using var stream = new MemoryStream();
            using (var archive = new ZipArchive(stream, ZipArchiveMode.Create, true))
            {
                foreach (var document in activeDocuments)
                {
                    var entryName = GetDocumentEntryName(document);
                    var entry = archive.CreateEntry(entryName, CompressionLevel.Fastest);
                    using var entryStream = entry.Open();
                    entryStream.Write(document.Data!);
                }
            }

            return new ContributionFilesDownload
            {
                Data = stream.ToArray(),
                FileName = $"contribution-{contribution.ContributionId}-files.zip",
                ContentType = "application/zip"
            };
        }

        private static void AddContributionDocumentsToArchive(ZipArchive archive, Contribution contribution)
        {
            var folderName = $"contribution-{contribution.ContributionId}";
            var documents = GetActiveDocuments(contribution);

            foreach (var document in documents)
            {
                var entryName = GetDocumentEntryName(document);
                var entry = archive.CreateEntry($"{folderName}/{entryName}", CompressionLevel.Fastest);
                using var entryStream = entry.Open();
                entryStream.Write(document.Data!);
            }
        }

        private static List<Document> GetActiveDocuments(Contribution contribution)
        {
            return contribution.Documents
                .Where(document => document.IsActive && document.Data != null && document.Data.Length > 0)
                .ToList();
        }

        private static string GetDocumentEntryName(Document document)
        {
            return string.IsNullOrWhiteSpace(document.FileName)
                ? $"{document.DocumentId}{document.Extension}"
                : document.FileName;
        }
    }
}
