namespace CMS.Domain.Entities;

public partial class vw_ContributionsWithoutCommentAfter14Day
{
    public Guid? ContributionId { get; set; }

    public Guid? FacultyId { get; set; }

    public Guid? ContributionWindowId { get; set; }

    public Guid? UserId { get; set; }

    public string? Subject { get; set; }

    public DateTime? CreatedDate { get; set; }
}
