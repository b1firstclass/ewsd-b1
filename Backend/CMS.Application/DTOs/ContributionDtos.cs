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
        public Guid FacultyId { get; set; }

        public Guid? CategoryId { get; set; }

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

    public class ContributionRatingRequest
    {
        [Range(1, 5)]
        public int Rating { get; set; }
    }

    public class ContributionStatusUpdateRequest
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }

    public class ContributionBulkSelectRequest
    {
        [Required]
        [MinLength(1)]
        public List<Guid> ContributionIds { get; set; } = new();
    }

    public class ContributionUpdateRequest
    {
        [MaxLength(100)]
        public string? Subject { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public Guid? CategoryId { get; set; }

        public ContributionFileRequest? DocumentFile { get; set; }

        public ContributionFileRequest? ImageFile { get; set; }
    }

    public class ContributionInfo
    {
        public Guid Id { get; set; }
        public Guid ContributionWindowId { get; set; }
        public Guid? CategoryId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
    }

    public class ContributionDocumentInfo
    {
        public Guid Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string Extension { get; set; } = string.Empty;
        public int Size { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedDate { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public Guid? ModifiedBy { get; set; }
    }

    public class ContributionDetailInfo : ContributionInfo
    {
        public CategoryInfo? Category { get; set; }
        public IReadOnlyList<ContributionDocumentInfo> Documents { get; set; } = Array.Empty<ContributionDocumentInfo>();
        public IReadOnlyList<CommentInfo> Comments { get; set; } = Array.Empty<CommentInfo>();
    }

    public class ContributionFilesDownload
    {
        public byte[] Data { get; set; } = Array.Empty<byte>();
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = "application/zip";
    }

    public class ContributionFileDownload
    {
        public byte[] Data { get; set; } = Array.Empty<byte>();
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = "application/octet-stream";
    }
}
