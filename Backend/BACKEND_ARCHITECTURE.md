# Backend API Architecture

## Overview

The backend is implemented as a RESTful API built on **ASP.NET Core (.NET 10)** and follows a **Clean Architecture** pattern, strictly separating concerns across four distinct projects within a single solution. The system is designed around a **Content Management System (CMS)** that handles user management, faculty-scoped contribution submissions, coordinator review workflows, and management reporting.

---

## Solution Structure

The solution is organised into four layered projects, each with a single, well-defined responsibility:

| Project | Role |
|---|---|
| `CMS.Api` | Presentation layer — HTTP controllers, middleware, security |
| `CMS.Application` | Application layer — business logic, services, interfaces, DTOs |
| `CMS.Domain` | Domain layer — entities, domain rules |
| `CMS.Infrastructure` | Infrastructure layer — EF Core, database, email, repositories |

Dependencies flow strictly inward: `CMS.Api` → `CMS.Application` → `CMS.Domain`, and `CMS.Infrastructure` implements interfaces defined in `CMS.Application`.

---

## Layer Breakdown

### 1. Domain Layer (`CMS.Domain`)

The domain layer defines the core business entities with no external dependencies. The primary entities are:

- **`User`** — authenticated system users, each assigned a single `Role` and one or more `Faculty` associations.
- **`Role` / `Permission`** — role-based access control; each role carries a collection of fine-grained permissions.
- **`Contribution`** — the central entity representing a student submission, tracking full lifecycle state (draft, submitted, reviewed) with audit timestamps for submission, review, and comments.
- **`ContributionWindow`** — defines submission open and closure dates per academic year, with `SubmissionOpenDate`, `SubmissionEndDate`, and `ClosureDate`.
- **`Document`** — file attachments (document and image) linked to contributions.
- **`Comment`** — coordinator comments on contributions.
- **`Faculty`** — organisational faculty unit scoping users and contributions.
- **`Category`** — classification taxonomy for contributions.
- **`UserActivityLog`** — audit trail of user HTTP activity.

Several pre-built **database views** support the reporting layer without application-level aggregation:

| View | Purpose |
|---|---|
| `vw_ContributionCountByFacultyAcademicYear` | Contribution counts grouped by faculty and academic year |
| `vw_ContributionPercentageByFacultyAcademicYear` | Contribution share percentages per faculty |
| `vw_ContributionsWithoutComment` | Contributions that have received no coordinator comment |
| `vw_ContributionsWithoutCommentAfter14Day` | Contributions with no comment after 14 days |
| `vw_UserActivityCount` | Aggregated request counts per user |
| `vw_PageAccessCount` | Aggregated request counts per route |
| `vw_BrowserList` | Browser usage breakdown from activity logs |

---

### 2. Application Layer (`CMS.Application`)

The application layer owns all business logic and orchestration. It exposes **service interfaces** that the API and infrastructure layers depend on, ensuring testability and loose coupling.

**Core services** and their responsibilities:

| Service | Responsibility |
|---|---|
| `UsersService` | User CRUD, login, refresh token flow, password change |
| `ContributionsService` | Contribution creation, update, status transitions, file attachment |
| `ContributionWindowsService` | Academic period management |
| `CommentsService` | Coordinator feedback on contributions |
| `FacultiesService` | Faculty management |
| `RolesService` / `PermissionsService` | Role and permission administration |
| `CategoryService` | Contribution category management |
| `ReportService` | Aggregated reports via database views |
| `ActivityLogService` | Querying persisted activity logs |

**Focused helper services** decompose complex logic from the primary services:

| Helper Service | Responsibility |
|---|---|
| `TokenService` | Generates signed JWT access tokens (with permission/faculty claims) and cryptographically random refresh tokens |
| `ContributionFileService` | Handles file upload, storage, and retrieval for contribution documents and images |
| `ContributionAuthorizationService` | Enforces business-level access rules for contribution operations (e.g. faculty scope enforcement) |
| `ContributionStatusService` | Encapsulates valid status transition logic |
| `UserValidationService` | Validates `LoginId` and email uniqueness during creation and updates |
| `UserAssignmentService` | Handles role and faculty assignment for users |

All services consume the `IUnitOfWork` abstraction and operate on **DTOs** (Data Transfer Objects), never exposing domain entities directly to the API layer. Object mapping between entities and DTOs is handled by **AutoMapper** profiles defined in both `CMS.Application` and `CMS.Infrastructure`.

---

### 3. Infrastructure Layer (`CMS.Infrastructure`)

The infrastructure layer provides concrete implementations of all `CMS.Application` repository and service interfaces.

#### Data Access

- **Entity Framework Core** with the **Npgsql** provider targets a **PostgreSQL** database.
- `AppDbContext` maps all entities and database views.
- A **generic `Repository<TEntity>`** provides standard CRUD operations (`GetByIdAsync`, `AddAsync`, `Update`, `Remove`).
- **Specialised repositories** extend the generic base with domain-specific queries, for example:
  - `UsersRepository.GetByLoginIdAsync`, `GetByRefreshTokenAsync`, `GetUsersByFacultyIdAsync`
  - `ContributionsRepository` with faculty-scoped filtering and status-based queries
- The **Unit of Work** pattern (`UnitOfWork`) wraps all repositories under a single `SaveChangesAsync` transaction boundary, accessed through `IUnitOfWork`.

```
IUnitOfWork
├── UsersRepository
├── RolesRepository
├── FacultiesRepository
├── PermissionsRepository
├── ContributionWindowsRepository
├── ContributionsRepository
├── CommentsRepository
├── ReportRepository
├── CategoryRepository
└── Repository<TEntity>   (generic fallback)
```

#### Email Service

`SmtpEmailService` implements `IEmailService`, providing HTML email dispatch. It is used, for example, to notify faculty coordinators when a new guest user is registered under their faculty.

---

### 4. API Layer (`CMS.Api`)

The API layer exposes HTTP endpoints, handles request/response shaping, enforces authentication and authorisation, and manages cross-cutting concerns via middleware.

**Controllers** provide RESTful endpoints for each domain area:

| Controller | Base Route |
|---|---|
| `UsersController` | `/api/users` |
| `ContributionsController` | `/api/contributions` |
| `ContributionWindowsController` | `/api/contributionwindows` |
| `CommentsController` | `/api/comments` |
| `FacultiesController` | `/api/faculties` |
| `RolesController` | `/api/roles` |
| `PermissionsController` | `/api/permissions` |
| `CategoriesController` | `/api/categories` |
| `ActivityLogController` | `/api/activitylog` |
| `ReportController` | `/api/report` |

All responses are wrapped in a standardised `ApiResponse<T>` envelope:

```json
{
  "message": "...",
  "data": { },
  "errors": { },
  "timestamp": "2025-01-01T00:00:00Z"
}
```

Paginated endpoints return a `PagedResponse<T>` with a total count for client-side pagination.

---

## Security Architecture

Authentication and authorisation are implemented through two complementary mechanisms.

### JWT-Based Authentication

- On successful login, the API issues a short-lived **JWT access token** and a long-lived **opaque refresh token**.
- The access token carries custom claims:

| Claim | Key | Content |
|---|---|---|
| Permissions | `cms:permissions` | List of granted permission names |
| Faculty IDs | `cms:faculty_ids` | Faculty GUIDs the user belongs to |
| Faculty names | `cms:faculty_names` | Corresponding faculty names |
| Role IDs | `cms:role_ids` | Role GUID |

- The refresh token is a cryptographically random 64-byte value stored server-side on the `User` entity and validated on each rotation request.

### Permission-Based Authorisation

- A custom `[HasPermission("Permission.Name")]` attribute on controller actions declares required permissions declaratively (e.g. `[HasPermission(PermissionNames.ContributionCreate)]`).
- A custom `PermissionPolicyProvider` dynamically builds `IAuthorizationPolicy` objects at runtime, which are evaluated by `PermissionAuthorizationHandler` against the permission claims embedded in the token.
- Role-based guards (`[Authorize(Roles = RoleNames.Student)]`) are applied alongside permission checks where role-level scoping is required.

The five system roles are:

| Role | Description |
|---|---|
| `Admin` | Full system access |
| `Manager` | Cross-faculty reporting and oversight |
| `Coordinator` | Reviews contributions within their faculty |
| `Student` | Submits contributions |
| `Guest` | Read-only access to published contributions |

The full set of granular permissions spans:
`User`, `Role`, `Permission`, `Faculty`, `ContributionWindow`, `Contribution`, `Comment`, `ActivityLog`, `Report`, and `Category` — each with standard `Read`, `Create`, `Update`, and `Delete` variants where applicable.

### Password Security

Passwords are hashed using **Argon2id** via a custom `Argon2PasswordHasher<T>` that implements the standard `IPasswordHasher<T>` interface:

| Parameter | Value |
|---|---|
| Algorithm | Argon2id |
| Memory | 64 MB (65,536 KB) |
| Iterations | 3 |
| Parallelism | 2 |
| Salt size | 128 bits (16 bytes) |
| Hash output | 256 bits (32 bytes) |

---

## Cross-Cutting Concerns

### User Activity Logging

`UserActivityLoggingMiddleware` intercepts every HTTP request and persists a `UserActivityLog` entry containing:

- User ID, request path, HTTP method, response status code
- Request duration (via `Stopwatch`)
- Client IP address
- Parsed user-agent details (device family, browser name and version, OS name and version) via the **UAParser** library

This data feeds the analytics and reporting endpoints.

### Structured Logging

The application uses **Serilog** configured via environment-specific `serilog.{environment}.json` files, providing structured log output with contextual information across all layers.

### Validation

- Model validation is handled by ASP.NET Core's built-in model binding with Data Annotations.
- On validation failure, the `InvalidModelStateResponseFactory` returns a standardised `ApiResponse` error envelope with a per-field error dictionary rather than the default `ValidationProblemDetails`.
- Custom validation attributes (e.g. `PasswordValidationAttribute`) and domain-level validators (e.g. `UserValidator`, `FacultyValidator`, `RoleValidator`, `ContributionWindowValidator`) enforce business rules in the application layer.

### Dependency Injection

Service registration is encapsulated in extension methods:
- `AddApplication()` in `CMS.Application` — registers all services, validators, and helpers.
- `AddInfrastructure()` in `CMS.Infrastructure` — registers EF Core, repositories, Unit of Work, and email service.

This keeps `Program.cs` clean and each layer self-contained.

---

## Reporting and Analytics Architecture

Reporting is implemented as a dedicated read-only flow designed for management visibility and operational monitoring.

### Reporting Pipeline

```
ReportController (/api/report)
        ↓
ReportService (application orchestration)
        ↓
ReportRepository (infrastructure data access)
        ↓
PostgreSQL reporting views (pre-aggregated query model)
```

This approach keeps reporting queries out of transactional contribution services and avoids expensive runtime aggregation in the API layer.

### Data Model for Reports

The reporting module reads from database views optimised for analytics use cases:

- `vw_ContributionCountByFacultyAcademicYear`
- `vw_ContributionPercentageByFacultyAcademicYear`
- `vw_ContributionsWithoutComment`
- `vw_ContributionsWithoutCommentAfter14Day`
- `vw_UserActivityCount`
- `vw_PageAccessCount`
- `vw_BrowserList`

### Security and Access Scope

- Reporting endpoints are exposed through `ReportController` (`/api/report`).
- Access is protected through JWT authentication and permission-based authorisation (`Report.*` permissions).
- Management-focused roles (especially `Manager` and `Admin`) consume cross-faculty reporting for oversight.

### Reporting Categories

The reporting capability is structured around three categories:

1. **Contribution analytics** — submission volume and faculty share by academic year.
2. **Workflow compliance analytics** — contributions missing coordinator comments, including >14-day delays.
3. **Platform usage analytics** — user activity, page access frequency, and browser distribution.

### Reports Provided by the System

The system provides the following report types:

| Report Type | Description | Data Source |
|---|---|---|
| Contribution Count by Faculty and Academic Year | Total number of contributions grouped by faculty within an academic year. | `vw_ContributionCountByFacultyAcademicYear` |
| Contribution Percentage by Faculty and Academic Year | Faculty contribution share as a percentage of total submissions for the academic year. | `vw_ContributionPercentageByFacultyAcademicYear` |
| Contributions Without Comment | List/count of contributions that have not received any coordinator comment. | `vw_ContributionsWithoutComment` |
| Contributions Without Comment After 14 Days | List/count of contributions still missing coordinator comment after 14 days. | `vw_ContributionsWithoutCommentAfter14Day` |
| User Activity Count | Aggregated request/activity totals per user. | `vw_UserActivityCount` |
| Page Access Count | Aggregated request totals by route/page endpoint. | `vw_PageAccessCount` |
| Browser Usage List | Browser distribution statistics based on captured user-agent data. | `vw_BrowserList` |

---

## Contribution Workflow

Contribution management is the core business process of the CMS. It follows a structured, role-gated lifecycle governed by the `ContributionStatusService`, `ContributionAuthorizationService`, and the `ContributionsController`.

### Contribution Statuses

| Status | Description |
|---|---|
| `Draft` | Initial state after creation; editable by the student owner |
| `Submitted` | Student has submitted for coordinator review; locked for editing |
| `Under Review` | Coordinator has picked up the contribution for review |
| `Revision Required` | Coordinator has returned it to the student with feedback |
| `Approved` | Coordinator has approved the contribution |
| `Rejected` | Coordinator has rejected the contribution |
| `Selected` | Coordinator has selected an approved contribution for publication |

### Status Transition Rules

Transitions are strictly enforced by `ContributionStatusService` and `ContributionAuthorizationService`. Attempting an invalid transition throws an `InvalidOperationException`, which the controller maps to an HTTP `409 Conflict`.

```
[Draft] ──────────────────────────────────────────────► [Submitted]
                                                              │
                                                              ▼
                                                       [Under Review]
                                                         /    |    \
                                                        /     |     \
                                                       ▼      ▼      ▼
                                              [Approved] [Rejected] [Revision Required]
                                                  │                        │
                                                  ▼                        │
                                             [Selected]                    │
                                                                           ▼
                                                                        [Draft] ──► (re-submit)
```

### Workflow Steps and API Endpoints

#### Step 1 — Create (Student)
`POST /api/contributions` · Role: `Student` · Permission: `Contribution.Create`

- Student uploads a contribution within an open `ContributionWindow`, providing subject, description, an optional category, a required document file (`.doc`/`.docx`, max 10 MB), and an optional image file (`.jpg`/`.jpeg`/`.png`/`.gif`/`.webp`, max 5 MB).
- Contribution is persisted with status `Draft`.
- Faculty coordinators are notified by email.

#### Step 2 — Update (Student)
`PUT /api/contributions/{id}` · Role: `Student` · Permission: `Contribution.Update`

- Only the contribution **owner** can update.
- Permitted only when status is `Draft` or `Revision Required`.
- Replacing a file disables the previous active document of that type (soft-delete via `IsActive = false`) and attaches the new one.

#### Step 3 — Submit (Student)
`PUT /api/contributions/{id}/submit` · Role: `Student` · Permission: `Contribution.Update`

- Only the owner can submit.
- Permitted from `Draft` or `Revision Required` status.
- Validates that at least one coordinator exists in the student's faculty before allowing submission.
- Status advances to `Submitted`; `SubmittedDate` and `SubmittedBy` are recorded.
- Faculty coordinators are notified by email.

#### Step 4 — Review (Coordinator)
`PUT /api/contributions/{id}/review` · Role: `Coordinator` · Permission: `Contribution.Update`

- Only permitted from `Submitted` status.
- Coordinator must belong to the same faculty as the contribution owner.
- Status advances to `Under Review`; `ReviewedDate` and `ReviewedBy` are recorded.

#### Step 5a — Approve (Coordinator)
`PUT /api/contributions/{id}/approve` · Role: `Coordinator` · Permission: `Contribution.Update`

- Only permitted from `Under Review` status.
- Status advances to `Approved`.

#### Step 5b — Reject (Coordinator)
`PUT /api/contributions/{id}/reject` · Role: `Coordinator` · Permission: `Contribution.Update`

- Only permitted from `Under Review` status.
- Status advances to `Rejected`. Terminal state — no further transitions are allowed.

#### Step 5c — Request Revision (Coordinator)
`PUT /api/contributions/{id}/request-revision` · Role: `Coordinator` · Permission: `Contribution.Update`

- Only permitted from `Under Review` status.
- Status reverts to `Revision Required`, allowing the student to update and re-submit.

#### Step 6 — Select (Coordinator)
`PUT /api/contributions/{id}/select` · Role: `Coordinator` · Permission: `Contribution.Update`

- Only permitted from `Approved` status.
- Status advances to `Selected`, marking the contribution for publication.
- Bulk selection of multiple approved contributions is also supported via `PUT /api/contributions/select`.

### File Download

| Endpoint | Role | Description |
|---|---|---|
| `GET /api/contributions/documents/{documentId}/download` | Any authenticated | Downloads a single attached document |
| `GET /api/contributions/selected/{id}/download` | `Manager` | Downloads all files of a selected contribution as a ZIP archive |
| `POST /api/contributions/selected/download` | `Manager` | Bulk-downloads files for multiple selected contributions as a ZIP archive |

### Viewing Contributions

| Endpoint | Role | Description |
|---|---|---|
| `GET /api/contributions` | `Student`, `Coordinator` | Lists the caller's own contributions, filterable by status |
| `GET /api/contributions/selected` | `Manager`, `Guest` | Lists all selected contributions, optionally filtered by contribution window |
| `GET /api/contributions/{id}` | Any authenticated | Retrieves a single contribution by ID |

---

## Technology Stack Summary

| Concern | Technology | Justification |
|---|---|---|
| Framework | ASP.NET Core (.NET 10) | Latest LTS-aligned Microsoft web framework; provides built-in dependency injection, middleware pipeline, and minimal overhead for high-throughput REST APIs. |
| Language | C# 14 | Strong static typing, modern language features (pattern matching, records, nullable reference types), and full .NET 10 compatibility reduce runtime errors and improve maintainability. |
| Database | PostgreSQL | Open-source, production-grade relational database with excellent support for GUIDs, JSON, and advanced indexing; well-supported by the Npgsql EF Core provider. |
| ORM | Entity Framework Core (Npgsql) | Code-first migrations, LINQ query composition, and the Unit of Work pattern reduce boilerplate SQL; Npgsql provides first-class PostgreSQL support including array types and native UUID handling. |
| Authentication | JWT Bearer tokens | Stateless, self-contained tokens allow horizontal scaling without shared session state; access/refresh token rotation limits exposure window on token compromise. |
| Password hashing | Argon2id (`Konscious.Security.Cryptography`) | Argon2id is the winner of the Password Hashing Competition and is recommended by OWASP; its memory-hardness (64 MB) makes GPU-based brute-force attacks computationally expensive. |
| Object mapping | AutoMapper | Eliminates repetitive entity-to-DTO mapping code, enforces a strict boundary between domain entities and API contracts, and centralises mapping configuration in dedicated profiles. |
| Logging | Serilog | Structured logging with environment-specific configuration files; supports multiple sinks (console, file, etc.) without code changes, and integrates natively with the ASP.NET Core `ILogger` abstraction. |
| Email | SMTP (`SmtpEmailService`) | Lightweight, dependency-free email delivery sufficient for transactional notifications (e.g. coordinator alerts); easily swappable behind the `IEmailService` interface. |
| User-agent parsing | UAParser | Accurately parses browser, OS, and device information from HTTP `User-Agent` headers for activity logging and browser analytics reporting. |
| Caching | `IMemoryCache` (ASP.NET Core in-memory) | Zero-dependency in-process cache suitable for short-lived, frequently read data; no additional infrastructure required for single-instance deployments. |
| API documentation | OpenAPI (built-in .NET 10 `AddOpenApi`) | Native .NET 10 OpenAPI support with no third-party dependency; generates a machine-readable API specification for client code generation and testing tooling. |
