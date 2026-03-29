using CMS.Application.Common;
using CMS.Application.Interfaces.Services;
using CMS.Application.Services;
using CMS.Application.Utilities;
using CMS.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace CMS.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            // Core Services
            services.AddScoped<IPasswordHasher<User>, Argon2PasswordHasher<User>>();
            services.AddScoped<IUsersService, UsersService>();
            services.AddScoped<IFacultiesService, FacultiesService>();
            services.AddScoped<IRolesService, RolesService>();
            services.AddScoped<IPermissionsService, PermissionsService>();
            services.AddScoped<IContributionWindowsService, ContributionWindowsService>();
            services.AddScoped<IContributionsService, ContributionsService>();
            services.AddScoped<IActivityLogService, ActivityLogService>();
            services.AddScoped<ICommentsService, CommentsService>();
            services.AddScoped<IReportService, ReportService>();
            services.AddScoped<ICategoryService, CategoryService>();

            // Authorization Helpers
            services.AddScoped<IContributionAuthorizationService, ContributionAuthorizationService>();

            // File Helpers
            services.AddScoped<IContributionFileService, ContributionFileService>();

            // Status Helpers
            services.AddScoped<IContributionStatusService, ContributionStatusService>();

            // Token Helpers
            services.AddScoped<ITokenService>(sp =>
            {
                var appSettings = sp.GetRequiredService<IOptions<AppSettings>>().Value;
                return new TokenService(appSettings.JwtSettings);
            });

            // User Helpers
            services.AddScoped<IUserValidationService, UserValidationService>();
            services.AddScoped<IUserAssignmentService, UserAssignmentService>();

            return services;
        }
    }
}
