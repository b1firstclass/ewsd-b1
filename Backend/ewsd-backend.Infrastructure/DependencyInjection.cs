using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ewsd_backend.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            // Register infrastructure layer services here
            // Example: configure database or external providers using configuration
            // services.AddDbContext<AppDbContext>(options =>
            //     options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
            return services;
        }
    }
}
