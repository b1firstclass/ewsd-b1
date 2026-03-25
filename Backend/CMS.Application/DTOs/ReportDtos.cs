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

    public class DeviceActivityCountDto
    {
        public string Device { get; init; } = null!;
        public long Count { get; init; }
    }

    public class ActivityCountByHourDto
    {
        public DateTime Hour { get; init; }
        public long Count { get; init; }
    }

    public class ContributionStatusCountDto
    {
        public string Status { get; set; } = null!;
        public int Count { get; set; }
    }

    public class ContributionStatusSummaryDto
    {
        public IReadOnlyList<ContributionStatusCountDto> Items { get; init; } = [];
        public int TotalCount { get; init; }
    }

    public class FacultyContributionStatusRawDto
    {
        public Guid FacultyId { get; init; }
        public string FacultyName { get; init; } = null!;
        public string Status { get; init; } = null!;
        public int Count { get; init; }
    }

    public class FacultyContributionStatusSummaryDto
    {
        public Guid FacultyId { get; init; }
        public string FacultyName { get; init; } = null!;
        public IReadOnlyList<ContributionStatusCountDto> Items { get; init; } = [];
        public int TotalCount { get; init; }
    }

    public class FacultyUserCountDto
    {
        public Guid FacultyId { get; init; }
        public string FacultyName { get; init; } = null!;
        public int Count { get; init; }
    }

    public class TopContributorDto
    {
        public Guid UserId { get; init; }
        public string FullName { get; init; } = null!;
        public string FacultyName { get; init; } = null!;
        public int ContributionCount { get; init; }
    }
}
