# Infrastructure Layer

This project contains implementations for persistence and external integrations.

## Structure

- `Persistence/` — Database context, configurations, migrations.
- `Repositories/` — Implementations of repository interfaces (data access).
- `Services/` — Adapters for external systems (email, queues, storage, etc.).
- `Mappings/` — Infrastructure-specific mapping profiles/configurations.

## Dependency Injection

`DependencyInjection.cs` exposes `AddInfrastructure` for registering infrastructure services and providers:

```csharp
services.AddInfrastructure(configuration);
```

Add registrations (e.g., DbContext, repositories, external service clients) inside `DependencyInjection.AddInfrastructure` using the provided `IConfiguration`.
