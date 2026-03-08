using System.ComponentModel.DataAnnotations;

namespace CMS.Application.DTOs
{
    #region request
    public class CommentCreateRequest
    {
        [Required]
        public Guid ContributionId { get; set; }

        [Required(ErrorMessage = "Comment is required")]
        [StringLength(500, MinimumLength = 1, ErrorMessage = "Comment must be between 1 and 500 characters")]
        public string Comment { get; set; } = string.Empty;
    }

    public class CommentUpdateRequest
    {
        [StringLength(500, MinimumLength = 1, ErrorMessage = "Comment must be between 1 and 500 characters")]
        public string? Comment { get; set; }

        public bool? IsActive { get; set; }
    }
    #endregion

    #region response
    public class CommentInfo
    {
        public Guid Id { get; set; }
        public Guid ContributionId { get; set; }
        public string Comment { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string? Poster { get; set; }
        public Guid? CreatedBy { get; set; }
        public Guid? ModifiedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
    }
    #endregion
}
