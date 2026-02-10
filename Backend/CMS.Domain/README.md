# Domain Layer

This project holds the core domain model and rules.

## Structure

- `Entities/` — Aggregate roots and entities.
- `Enums/` — Domain-specific enumerations.
- `Constants/` — Domain-level constants and identifiers.
- `Exceptions/` — Domain-specific exceptions.

## Guidance

Keep this layer free of infrastructure concerns. If you add repository interfaces or domain services, keep them framework-agnostic and let Application/Infrastructure handle wiring and persistence.
