using System.Globalization;

namespace CMS.Application.Utilities
{
    public static class UniqueNumberGenerator
    {
        private static readonly object Sync = new();
        private static long _lastTimestamp;
        private static int _sequence;

        public static string Generate(string? prefix = null, string? numberFormat = null)
        {
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            long number;

            lock (Sync)
            {
                if (timestamp == _lastTimestamp)
                {
                    _sequence++;
                }
                else
                {
                    _lastTimestamp = timestamp;
                    _sequence = 0;
                }

                number = (timestamp * 1000) + _sequence;
            }

            var format = string.IsNullOrWhiteSpace(numberFormat) ? "D" : numberFormat;
            var formattedNumber = number.ToString(format, CultureInfo.InvariantCulture);

            return string.Concat(prefix ?? string.Empty, formattedNumber);
        }
    }
}
