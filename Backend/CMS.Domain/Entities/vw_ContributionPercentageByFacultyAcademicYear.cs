namespace CMS.Domain.Entities;

public partial class vw_ContributionPercentageByFacultyAcademicYear
{
    public string? FacultyName { get; set; }

    public int? AcademicYearStart { get; set; }

    public int? AcademicYearEnd { get; set; }

    public long? FacultyContributions { get; set; }

    public decimal? YearTotalContributions { get; set; }

    public decimal? ContributionPercentage { get; set; }
}
