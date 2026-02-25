namespace CMS.Application.Common
{
    public static class DateTimeHelper
    {
        public static DateTime NormalizeToUtc(DateTime dateTime)
        {
            return dateTime.Kind switch
            {
                DateTimeKind.Utc => dateTime,
                DateTimeKind.Local => dateTime.ToUniversalTime(),
                _ => DateTime.SpecifyKind(dateTime, DateTimeKind.Utc)
            };
        }

        public static DateTime? NormalizeToUtc(DateTime? dateTime)
        {
            return dateTime.HasValue ? NormalizeToUtc(dateTime.Value) : null;
        }
    }
}
