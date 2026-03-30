using System.ComponentModel.DataAnnotations;

namespace CMS.Application.DTOs
{
    #region request
    public class CategoryCreateRequest
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 50 characters")]
        public required string Name { get; set; }

        [StringLength(255, ErrorMessage = "Description cannot exceed 255 characters")]
        public string? Description { get; set; }
    }

    public class CategoryUpdateRequest
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 50 characters")]
        public required string Name { get; set; }

        [StringLength(255, ErrorMessage = "Description cannot exceed 255 characters")]
        public string? Description { get; set; }

        public bool? IsActive { get; set; }
    }
    #endregion

    #region response
    public class CategoryInfo
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
    }
    #endregion
}
