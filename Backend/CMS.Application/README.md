# Application Layer

This project contains the application logic for the solution, organized using Clean Architecture.

## Structure

- `DTOs/` — Data transfer objects used by application services and API responses.
- `Interfaces/` — Contracts for repositories, services, and external dependencies consumed by the application layer.
- `Services/` — Application services/use cases that orchestrate business logic.
- `Common/` — Shared helpers or base types used across the application layer.

## Dependency Injection

`DependencyInjection.cs` exposes `AddApplication` for registering application-layer services:

```csharp
services.AddApplication();
```

Add registrations inside `DependencyInjection.AddApplication` as you implement services, handlers, and validators.
