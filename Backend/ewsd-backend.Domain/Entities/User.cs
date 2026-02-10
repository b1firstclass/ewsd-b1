using System;
using System.Collections.Generic;

namespace ewsd_backend.Infrastructure;

public partial class User
{
    public string UserId { get; set; } = null!;

    public string LoginId { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string FacultyId { get; set; } = null!;

    public DateTime? LastLoginDate { get; set; }

    public string? LastLoginIp { get; set; }

    public bool IsActive { get; set; }

    public DateTime? CreatedDate { get; set; }

    public string? CreatedBy { get; set; }

    public DateTime? ModifiedDate { get; set; }

    public string? ModifiedBy { get; set; }

    public virtual Faculty Faculty { get; set; } = null!;

    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();
}
