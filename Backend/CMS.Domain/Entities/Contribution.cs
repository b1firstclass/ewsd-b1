using System;
using System.Collections.Generic;

namespace CMS.Domain.Entities;

public partial class Contribution
{
    public Guid ContributionId { get; set; }

    public Guid UserId { get; set; }

    public Guid FacultyId { get; set; }

    public Guid ContributionWindowId { get; set; }

    public string Subject { get; set; } = null!;

    public string Description { get; set; } = null!;

    public int Rating { get; set; }

    public string Status { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime? CreatedDate { get; set; }

    public Guid? CreatedBy { get; set; }

    public DateTime? SubmittedDate { get; set; }

    public Guid? SubmittedBy { get; set; }

    public DateTime? ReviewedDate { get; set; }

    public Guid? ReviewedBy { get; set; }

    public DateTime? ModifiedDate { get; set; }

    public Guid? ModifiedBy { get; set; }

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public virtual ContributionWindow ContributionWindow { get; set; } = null!;

    public virtual ICollection<Document> Documents { get; set; } = new List<Document>();

    public virtual Faculty Faculty { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
