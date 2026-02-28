using CMS.Application.Common;
using CMS.Application.Interfaces.Services;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using Resend;

namespace CMS.Infrastructure.Services
{
    public class SmtpEmailService : IEmailService
    {
        private readonly EmailSettings _settings;

        public SmtpEmailService(IOptions<AppSettings> options)
        {
            _settings = options.Value.EmailSettings;
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
                var test = ex;
            }

        }
    }
}
