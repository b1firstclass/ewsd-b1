using Microsoft.Extensions.DependencyInjection;

namespace ewsd_backend.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            // Register application layer services here
            return services;
        }
    }
}
