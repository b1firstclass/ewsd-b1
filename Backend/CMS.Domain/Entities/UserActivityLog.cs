using System;
using System.Collections.Generic;

namespace CMS.Domain.Entities;

public partial class UserActivityLog
{
    public Guid ActivityId { get; set; }

    public Guid? UserId { get; set; }

    public string EventType { get; set; } = null!;

    public string Resource { get; set; } = null!;

    public string? HttpMethod { get; set; }

    public string? StatusCode { get; set; }

    public DateTime? LoggedDate { get; set; }

    public int? DurationMs { get; set; }

    public string? IpAddress { get; set; }

    public string? UserAgent { get; set; }

    public string? Device { get; set; }

    public string? Browser { get; set; }

    public string? BrowserVersion { get; set; }

    public string? OS { get; set; }

    public string? OsVersion { get; set; }

    public virtual User? User { get; set; }
}
