
using CMS.Application;
using CMS.Application.Common;
using CMS.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
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

            builder.Services.AddControllers()
                .ConfigureApiBehaviorOptions(options =>
                {
                    options.InvalidModelStateResponseFactory = context =>
                    {
                        var errors = new Dictionary<string, string[]>();
                        foreach (var key in context.ModelState.Keys)
                        {
                            var state = context.ModelState[key];
                            if (state != null && state.Errors.Count > 0)
                            {
                                errors[key] = state.Errors.Select(e => e.ErrorMessage).ToArray();
                            }
                        }

                        var response = ApiResponse.ErrorResponse("Validation failed", errors);
                        return new Microsoft.AspNetCore.Mvc.ObjectResult(response) { StatusCode = 400 };
                    };
                });

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

            builder.Services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    Description = "JWT Authorization header using the Bearer scheme."
                });

                options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
                {
                    [new OpenApiSecuritySchemeReference("bearer", document)] = []
                });
            });

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            //app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();
            app.MapHealthChecks("/health");

            app.Run();
        }
    }
}
