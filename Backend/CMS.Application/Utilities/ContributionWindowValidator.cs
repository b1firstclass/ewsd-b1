namespace CMS.Application.Utilities
{
    public static class ContributionWindowValidator
    {
        public static void ValidateWindowDates(DateTime? submissionOpenDate, DateTime? submissionEndDate, DateTime? closureDate)
        {
            if (submissionOpenDate.HasValue && submissionEndDate.HasValue && submissionOpenDate.Value > submissionEndDate.Value)
            {
                throw new InvalidOperationException("Submission end date must be after the submission open date.");
            }

            if (submissionEndDate.HasValue && closureDate.HasValue && submissionEndDate.Value > closureDate.Value)
            {
                throw new InvalidOperationException("Closure date must be after the submission end date.");
            }
        }

        public static void ValidateAcademicYears(int academicYearStart, int academicYearEnd)
        {
            if (academicYearEnd < academicYearStart)
            {
                throw new InvalidOperationException("AcademicYearEnd cannot be earlier than AcademicYearStart.");
            }
        }

        public static void ValidateDatesWithinAcademicYear(
            DateTime submissionOpenDate,
            DateTime submissionEndDate,
            DateTime closureDate,
            int academicYearStart,
            int academicYearEnd)
        {
            if (submissionOpenDate.Year < academicYearStart || submissionOpenDate.Year > academicYearEnd)
            {
                throw new InvalidOperationException("Submission open date must be within the academic year range.");
            }

            if (submissionEndDate.Year < academicYearStart || submissionEndDate.Year > academicYearEnd)
            {
                throw new InvalidOperationException("Submission end date must be within the academic year range.");
            }

            if (closureDate.Year < academicYearStart || closureDate.Year > academicYearEnd)
            {
                throw new InvalidOperationException("Closure date must be within the academic year range.");
            }
        }

        public static void EnsureAcademicYearAvailable(int academicYearStart, int academicYearEnd, bool exists)
        {
            if (exists)
            {
                throw new InvalidOperationException(
                    $"A contribution window with overlapping academic year already exists for {academicYearStart}-{academicYearEnd}.");
            }
        }
    }
}
