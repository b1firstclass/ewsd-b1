using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CMS.Application.DTOs
{
    #region request
    public class RoleCreateRequest
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
        public required string Name { get; set; }

        [StringLength(255)]
        public string? Description { get; set; }

        public List<string>? PermissionIds { get; set; }
    }

    public class RoleUpdateRequest
    {
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
        public string? Name { get; set; }

        [StringLength(255)]
        public string? Description { get; set; }

        public List<string>? PermissionIds { get; set; }
    }
    #endregion

    #region response
    public class RoleInfo
    {
        public required string Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public List<PermissionInfo> Permissions { get; set; } = new();
    }
    #endregion
}
