using System;
using System.ComponentModel.DataAnnotations;

namespace CMS.Application.DTOs
{
    #region request
    public class ContributionWindowCreateRequest
    {
        [Required]
        public DateTime SubmissionOpenDate { get; set; }

        [Required]
        public DateTime SubmissionEndDate { get; set; }

        [Required]
        public DateTime ClosureDate { get; set; }

        [Range(1900, 3000)]
        public int AcademicYearStart { get; set; }

        [Range(1900, 3000)]
        public int AcademicYearEnd { get; set; }
    }

    public class ContributionWindowUpdateRequest
    {
        public DateTime? SubmissionOpenDate { get; set; }

        public DateTime? SubmissionEndDate { get; set; }

        public DateTime? ClosureDate { get; set; }

        [Range(1900, 3000)]
        public int? AcademicYearStart { get; set; }

        [Range(1900, 3000)]
        public int? AcademicYearEnd { get; set; }

        public bool? IsActive { get; set; }
    }
    #endregion

    #region response
    public class ContributionWindowInfo
    {
        public Guid Id { get; set; }
        public DateTime? SubmissionOpenDate { get; set; }
        public DateTime? SubmissionEndDate { get; set; }
        public DateTime? ClosureDate { get; set; }
        public int AcademicYearStart { get; set; }
        public int AcademicYearEnd { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
    }
    #endregion
}
