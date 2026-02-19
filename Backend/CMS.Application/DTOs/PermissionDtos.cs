using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CMS.Application.DTOs
{
    #region request
    public class PermissionCreateRequest
    {
        [Required(ErrorMessage = "Module is required")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Module must be between 2 and 50 characters")]
        public required string Module { get; set; }

        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
        public required string Name { get; set; }

        [StringLength(255)]
        public string? Description { get; set; }

    }

    public class PermissionUpdateRequest
    {
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Module must be between 2 and 50 characters")]
        public string? Module { get; set; }

        [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
        public string? Name { get; set; }

        [StringLength(255)]
        public string? Description { get; set; }
    }
    #endregion

    #region response
    public class PermissionInfo
    {
        public Guid Id { get; set; }
        public required string Module { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
    }
    #endregion
}
