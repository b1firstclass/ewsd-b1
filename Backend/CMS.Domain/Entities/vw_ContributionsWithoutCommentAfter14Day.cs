namespace CMS.Domain.Entities;

public partial class vw_ContributionsWithoutCommentAfter14Day
{
    public Guid? ContributionId { get; set; }

    public Guid? FacultyId { get; set; }

    public string? FacultyName { get; set; }

    public Guid? ContributionWindowId { get; set; }

    public int? AcademicYearStart { get; set; }

    public int? AcademicYearEnd { get; set; }

    public Guid? UserId { get; set; }

    public string? FullName { get; set; }

    public string? Subject { get; set; }

    public DateTime? CreatedDate { get; set; }
}
