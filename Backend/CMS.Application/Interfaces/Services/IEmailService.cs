namespace CMS.Application.Interfaces.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string body, CancellationToken cancellationToken = default);

        string GenerateEmailBody(string title, string recipientName, string message, string? actionUrl = null, string? actionText = null);
    }
}
