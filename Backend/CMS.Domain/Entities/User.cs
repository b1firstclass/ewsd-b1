using System;
using System.Collections.Generic;

namespace CMS.Domain.Entities;

public partial class User
{
    public string UserId { get; set; } = null!;

    public string LoginId { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string FullName { get; set; } = null!;

    public DateTime? LastLoginDate { get; set; }

    public string? LastLoginIp { get; set; }

    public bool IsActive { get; set; }

    public DateTime? CreatedDate { get; set; }

    public string? CreatedBy { get; set; }

    public DateTime? ModifiedDate { get; set; }

    public string? ModifiedBy { get; set; }

    public string? RefreshToken { get; set; }

    public DateTime? RefreshTokenExpiresAt { get; set; }

    public virtual ICollection<Faculty> Faculties { get; set; } = new List<Faculty>();

    public virtual ICollection<Role> Roles { get; set; } = new List<Role>();
}
