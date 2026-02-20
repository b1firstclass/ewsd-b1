using CMS.Application.Common;
using CMS.Application.Interfaces.Services;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace CMS.Infrastructure.Services
{
    public class SmtpEmailService : IEmailService
    {
        private readonly EmailSettings _settings;

        public SmtpEmailService(IOptions<AppSettings> options)
        {
            _settings = options.Value.EmailSettings;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body, bool isHtml = true, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(_settings.Host))
            {
                throw new InvalidOperationException("Email settings are not configured.");
            }

            var message = new MimeMessage();
            var fromName = string.IsNullOrWhiteSpace(_settings.FromName) ? _settings.FromEmail : _settings.FromName;
            message.From.Add(new MailboxAddress(fromName, _settings.FromEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;

            var builder = new BodyBuilder();
            if (isHtml)
            {
                builder.HtmlBody = body;
            }
            else
            {
                builder.TextBody = body;
            }

            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            var secureOption = _settings.UseSsl
                ? SecureSocketOptions.SslOnConnect
                : _settings.UseStartTls
                    ? SecureSocketOptions.StartTls
                    : SecureSocketOptions.Auto;

            await client.ConnectAsync(_settings.Host, _settings.Port, secureOption, cancellationToken);

            if (!string.IsNullOrWhiteSpace(_settings.Username))
            {
                await client.AuthenticateAsync(_settings.Username, _settings.Password, cancellationToken);
            }

            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);
        }
    }
}
