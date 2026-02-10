using System;
using System.Collections.Generic;

namespace ewsd_backend.Infrastructure;

public partial class Permission
{
    public string PermissionId { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string Module { get; set; } = null!;

    public string? Description { get; set; }

    public bool IsActive { get; set; }

    public DateTime? CreatedDate { get; set; }

    public string? CreatedBy { get; set; }

    public DateTime? ModifiedDate { get; set; }

    public string? ModifiedBy { get; set; }

    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();
}
