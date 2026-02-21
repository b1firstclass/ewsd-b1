using System;
using System.ComponentModel.DataAnnotations;

namespace CMS.Application.DTOs
{
    public class ContributionFileRequest
    {
        [Required]
        public string FileName { get; set; } = string.Empty;

        [Required]
        public byte[] Data { get; set; } = Array.Empty<byte>();

        [Range(1, long.MaxValue)]
        public long Size { get; set; }
    }

    public class ContributionCreateRequest
    {
        [Required]
        public Guid ContributionWindowId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public ContributionFileRequest DocumentFile { get; set; } = new();

        public ContributionFileRequest? ImageFile { get; set; }
    }

    public class ContributionStatusUpdateRequest
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }

    public class ContributionUpdateRequest
    {
        [MaxLength(100)]
        public string? Subject { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public ContributionFileRequest? DocumentFile { get; set; }

        public ContributionFileRequest? ImageFile { get; set; }
    }

    public class ContributionInfo
    {
        public Guid Id { get; set; }
        public Guid ContributionWindowId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
    }

    public class ContributionFilesDownload
    {
        public byte[] Data { get; set; } = Array.Empty<byte>();
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = "application/zip";
    }
}
