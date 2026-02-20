namespace CMS.Application.Common
{
    public class AppSettings
    {
        public const string SectionName = "AppSettings";
        public required JwtSettings JwtSettings { get; set; }
        public required EmailSettings EmailSettings { get; set; }
    }

    public class JwtSettings
    {
        public required string Issuer { get; set; }
        public required string Audience { get; set; }
        public required string Key { get; set; }
        public int ExpiryMinutes { get; set; } = 60;
        public int RefreshExpiryMinutes { get; set; } = 1440;
    }

    public class EmailSettings
    {
        public required string Host { get; set; }
        public int Port { get; set; } = 587;
        public bool UseSsl { get; set; }
        public bool UseStartTls { get; set; } = true;
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string FromEmail { get; set; }
        public string? FromName { get; set; }
    }
}
