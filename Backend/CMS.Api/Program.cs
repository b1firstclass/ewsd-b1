
using CMS.Application;
using CMS.Application.Common;
using CMS.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Reflection;
using System.Text;

namespace CMS.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

            var configuration = new ConfigurationBuilder()
                .AddJsonFile($"appsettings.{environment}.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"serilog.{environment}.json", optional: false, reloadOnChange: true)
                .Build();

            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers();
            builder.Services.AddOpenApi();
            builder.Services.AddHealthChecks();
            builder.Services.AddAuthorization();

            builder.Services.AddAutoMapper(c =>
            {
                c.AddMaps(Assembly.GetExecutingAssembly());
            });

            builder.Services.AddApplication();
            builder.Services.AddInfrastructure(builder.Configuration);

            var appSettings = configuration.GetSection(AppSettings.SectionName).Get<AppSettings>()
                ?? throw new InvalidOperationException("AppSettings configuration is missing.");

            builder.Services.Configure<AppSettings>(configuration.GetSection(AppSettings.SectionName));

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = appSettings.JwtSettings.Issuer,
                        ValidAudience = appSettings.JwtSettings.Audience,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(appSettings.JwtSettings.Key))
                    };
                });

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.MapScalarApiReference();
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();
            app.MapHealthChecks("/health");

            app.Run();
        }
    }
}
