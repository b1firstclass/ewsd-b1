using CMS.Application.Common;
using CMS.Application.Interfaces.Services;
using CMS.Application.Services;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using Resend;
using System.Net;

namespace CMS.Infrastructure.Services
{
    public class SmtpEmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<SmtpEmailService> _logger;

        public SmtpEmailService(IOptions<AppSettings> options, ILogger<SmtpEmailService> logger)
        {
            _settings = options.Value.EmailSettings;
            _logger = logger;
        }

        public string GenerateEmailBody(
            string title,
            string recipientName,
            string message,
            string? actionUrl = null,
            string? actionText = null)
        {
            var safeTitle = WebUtility.HtmlEncode(title);
            var safeRecipientName = WebUtility.HtmlEncode(recipientName);
            var safeMessage = WebUtility.HtmlEncode(message).Replace("\n", "<br />");
            var safeActionUrl = string.IsNullOrWhiteSpace(actionUrl) ? null : WebUtility.HtmlEncode(actionUrl);
            var safeActionText = string.IsNullOrWhiteSpace(actionText) ? "Open" : WebUtility.HtmlEncode(actionText);

            var actionButton = string.IsNullOrWhiteSpace(safeActionUrl)
                ? string.Empty
                : $"<p style=\"margin-top: 20px;\"><a href=\"{safeActionUrl}\" style=\"background: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 6px; display: inline-block;\">{safeActionText}</a></p>";

            return $"""
                    <!doctype html>
                    <html>
                    <head>
                        <meta charset=\"utf-8\" />
                        <title>{safeTitle}</title>
                    </head>
                    <body style=\"font-family: Arial, sans-serif; background: #f6f8fb; margin: 0; padding: 24px;\">
                        <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\">
                            <tr>
                                <td align=\"center\">
                                    <table role=\"presentation\" width=\"600\" cellspacing=\"0\" cellpadding=\"0\" style=\"background: #ffffff; border-radius: 10px; padding: 24px;\">
                                        <tr>
                                            <td>
                                                <p>Hello {safeRecipientName},</p>
                                                <p>{safeMessage}</p>
                                                {actionButton}
                                                <p style=\"margin-top: 24px;\">Regards,<br />EchoPress Team</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                    """;
        }

       
        public async Task SendEmailAsync(string toEmail, string subject, string body, CancellationToken cancellationToken = default)
        {

            try
            {
                IResend resend = ResendClient.Create(_settings.ApiKey);

                var resp = await resend.EmailSendAsync(new EmailMessage()
                {
                    From = _settings.FromName + " " + _settings.FromEmail,
                    To = toEmail,
                    Subject = subject,
                    HtmlBody = body
                }, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email to {ToEmail} with subject {Subject}", toEmail, subject);
            }

        }
    }
}
