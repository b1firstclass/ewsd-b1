using Microsoft.Extensions.DependencyInjection;

namespace CMS.Application
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
