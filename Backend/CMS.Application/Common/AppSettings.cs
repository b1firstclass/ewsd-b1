using System;
using System.Collections.Generic;
using System.Text;

namespace CMS.Application.Common
{
    public class AppSettings
    {
        public const string SectionName = "AppSettings";
    }

    public class JwtSettings
    {
        public required string Issuer { get; set; }
        public required string Audience { get; set; }
        public required string Key { get; set; }
        public int ExpiryMinutes { get; set; } = 60;
        public int RefreshExpiryMinutes { get; set; } = 1440;
    }
}
