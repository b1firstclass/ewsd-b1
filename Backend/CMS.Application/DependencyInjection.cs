using CMS.Application.Interfaces.Services;
using CMS.Application.Services;
using CMS.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace CMS.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
            services.AddScoped<IUsersService, UsersService>();
            services.AddScoped<IFacultiesService, FacultiesService>();
            services.AddScoped<IRolesService, RolesService>();
            services.AddScoped<IPermissionsService, PermissionsService>();
            services.AddScoped<IContributionWindowsService, ContributionWindowsService>();

            return services;
        }
    }
}
