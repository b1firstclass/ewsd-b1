namespace CMS.Domain.Entities;

public partial class vw_ContributionCountByFacultyAcademicYear
{
    public string? FacultyName { get; set; }

    public int? AcademicYearStart { get; set; }

    public int? AcademicYearEnd { get; set; }

    public long? TotalContributions { get; set; }
}
