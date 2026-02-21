
using CMS.Api.Middleware;
using CMS.Api.Security;
using CMS.Api.Services;
using CMS.Api.Utilities;
using CMS.Application;
using CMS.Application.Common;
using CMS.Application.Interfaces.Services;
using CMS.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Reflection;
using System.Text;
using System.Text.Json;
using UAParser.Extensions;

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
            builder.Services.AddUserAgentParser();
            builder.Services.AddMemoryCache();
            builder.Services.AddHealthChecks();
            builder.Services.AddAuthorization();
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                    policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
            });
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

            builder.Services.Configure<ForwardedHeadersOptions>(
                options => { options.ForwardedHeaders = ForwardedHeaders.XForwardedFor; }
            );

            builder.Services.AddAutoMapper(c =>
            {
                c.AddMaps(Assembly.GetExecutingAssembly());
            });

            builder.Services.AddApplication();
            builder.Services.AddInfrastructure(builder.Configuration);

            builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
            builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

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

                    options.Events = new JwtBearerEvents
                    {
                        OnChallenge = context =>
                        {
                            context.HandleResponse();
                            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                            context.Response.ContentType = "application/json";
                            var response = ApiResponse.ErrorResponse(ApiResponseMessages.Unauthorized);
                            var payload = JsonSerializer.Serialize(response);
                            return context.Response.WriteAsync(payload);
                        },
                        OnForbidden = context =>
                        {
                            context.Response.StatusCode = StatusCodes.Status403Forbidden;
                            context.Response.ContentType = "application/json";
                            var response = ApiResponse.ErrorResponse(ApiResponseMessages.Forbidden);
                            var payload = JsonSerializer.Serialize(response);
                            return context.Response.WriteAsync(payload);
                        }
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

            app.UseForwardedHeaders();
            app.UseCors("AllowAll");
            app.UseAuthentication();
            app.UseMiddleware<UserActivityLoggingMiddleware>();
            app.UseAuthorization();

            app.MapControllers();
            app.MapHealthChecks("/health");

            app.Run();
        }
    }
}
