
using ewsd_backend.Application;
using ewsd_backend.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Scalar.AspNetCore;
using System.Reflection;

namespace ewsd_backend.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

            var configuration = new ConfigurationBuilder()
                .AddJsonFile($"appsettings.{environment}.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"serilog.{environment}.json", optional: false, reloadOnChange: true);

            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers();
            
            builder.Services.AddOpenApi();
            builder.Services.AddAutoMapper(c =>
            {
                c.AddMaps(Assembly.GetExecutingAssembly());
            });

            builder.Services.AddApplication();
            builder.Services.AddInfrastructure(builder.Configuration);

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.MapScalarApiReference();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
