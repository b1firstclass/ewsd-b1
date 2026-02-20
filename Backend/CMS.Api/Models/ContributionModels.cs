using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace CMS.Api.Models
{
    public class ContributionCreateForm
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
        public IFormFile DocumentFile { get; set; } = default!;

        public IFormFile? ImageFile { get; set; }
    }

    public class ContributionUpdateForm
    {
        [MaxLength(100)]
        public string? Subject { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public IFormFile? DocumentFile { get; set; }

        public IFormFile? ImageFile { get; set; }
    }
}
