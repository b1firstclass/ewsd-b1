using System;
using System.Collections.Generic;

namespace CMS.Domain.Entities;

public partial class ContributionWindow
{
    public Guid ContributionWindowId { get; set; }

    public DateTime SubmissionOpenDate { get; set; }

    public DateTime SubmissionEndDate { get; set; }

    public DateTime ClosureDate { get; set; }

    public int AcademicYearStart { get; set; }

    public int AcademicYearEnd { get; set; }

    public bool IsActive { get; set; }

    public DateTime? CreatedDate { get; set; }

    public Guid? CreatedBy { get; set; }

    public DateTime? ModifiedDate { get; set; }

    public Guid? ModifiedBy { get; set; }

    public virtual ICollection<Contribution> Contributions { get; set; } = new List<Contribution>();
}
