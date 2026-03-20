namespace CMS.Application.DTOs
{
    public class BrowserListDto
    {
        public string? Browser { get; set; }
        public long? Count { get; set; }
    }

    public class ContributionCountByFacultyAcademicYearDto
    {
        public string? FacultyName { get; set; }
        public int? AcademicYearStart { get; set; }
        public int? AcademicYearEnd { get; set; }
        public long? TotalContributions { get; set; }
    }

    public class ContributionPercentageByFacultyAcademicYearDto
    {
        public string? FacultyName { get; set; }
        public int? AcademicYearStart { get; set; }
        public int? AcademicYearEnd { get; set; }
        public long? FacultyContributions { get; set; }
        public decimal? YearTotalContributions { get; set; }
        public decimal? ContributionPercentage { get; set; }
    }

    public class ContributionsWithoutCommentDto
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

    public class PageAccessCountDto
    {
        public string? Resource { get; set; }
        public long? Count { get; set; }
    }

    public class UserActivityCountDto
    {
        public string? FullName { get; set; }
        public Guid? UserId { get; set; }
        public long? Count { get; set; }
    }
}
