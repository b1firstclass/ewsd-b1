# Infrastructure Layer

This project contains implementations for persistence and external integrations.

## Structure

- `Persistence/` � Database context, configurations, migrations.
- `Repositories/` � Implementations of repository interfaces (data access).
- `Services/` � Adapters for external systems (email, queues, storage, etc.).
- `Mappings/` � Infrastructure-specific mapping profiles/configurations.

## Dependency Injection

`DependencyInjection.cs` exposes `AddInfrastructure` for registering infrastructure services and providers:

```csharp
services.AddInfrastructure(configuration);
```

Add registrations (e.g., DbContext, repositories, external service clients) inside `DependencyInjection.AddInfrastructure` using the provided `IConfiguration`.

## Migration Script

```cmd
dotnet ef dbcontext scaffold "Host=pg-114e3ca1-project-0b1c.l.aivencloud.com;Port=16774;Database=CMS;Username=avnadmin;Password=AVNS_HrT7gA3tm0aOuDXle2H" Npgsql.EntityFrameworkCore.PostgreSQL --context AppDbContext --context-dir Persistence --output-dir ../CMS.Domain/Entities --use-database-names --no-onconfiguring -f
```
