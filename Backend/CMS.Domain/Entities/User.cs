using System;
using System.Collections.Generic;

namespace CMS.Domain.Entities;

public partial class User
{
    public string UserId { get; set; } = null!;

    public string LoginId { get; set; } = null!;

    /// <summary>
    /// hashed password
    /// </summary>
    public string Password { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string FullName { get; set; } = null!;

    /// <summary>
    /// If this value is null, then this is the first time login
    /// </summary>
    public DateTime? LastLoginDate { get; set; }

    public string? LastLoginIp { get; set; }

    public bool IsActive { get; set; }

    public DateTime? CreatedDate { get; set; }

    public string? CreatedBy { get; set; }

    public DateTime? ModifiedDate { get; set; }

    public string? ModifiedBy { get; set; }

    public virtual ICollection<Faculty> Faculties { get; set; } = new List<Faculty>();

    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();
}
