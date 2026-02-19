using System;
using System.Collections.Generic;

namespace CMS.Domain.Entities;

public partial class Permission
{
    public Guid PermissionId { get; set; }

    public string Name { get; set; } = null!;

    public string Module { get; set; } = null!;

    public string? Description { get; set; }

    public bool IsActive { get; set; }

    public DateTime? CreatedDate { get; set; }

    public Guid? CreatedBy { get; set; }

    public DateTime? ModifiedDate { get; set; }

    public Guid? ModifiedBy { get; set; }

    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();
}
