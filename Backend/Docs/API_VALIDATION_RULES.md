# CMS API — Validation Rules, Limitations & Error Responses

## Table of Contents

1. [Global Rules](#global-rules)
2. [Pagination Parameters](#pagination-parameters)
3. [ActivityLog Controller](#activitylog-controller)
4. [Comments Controller](#comments-controller)
5. [Contributions Controller](#contributions-controller)
6. [ContributionWindows Controller](#contributionwindows-controller)
7. [Faculties Controller](#faculties-controller)
8. [Permissions Controller](#permissions-controller)
9. [Report Controller](#report-controller)
10. [Roles Controller](#roles-controller)
11. [Users Controller](#users-controller)

---

## Global Rules

- **Authentication**: All endpoints require a valid **JWT Bearer token** unless explicitly marked as `[AllowAnonymous]`.
- **Authorization**: Endpoints are further restricted by a **permission** (`HasPermission`) and/or a **role** (`Authorize(Roles = ...)`).
- **Model Validation**: Invalid request bodies return `400 Validation failed` with field-level error details.
- **GUID Parameters**: All GUID path parameters must be non-empty (`Guid.Empty` is rejected with `400 <Resource> id is required`).
- **Conflict (409)**: Returned when a business rule prevents the operation (e.g., duplicate name, invalid state transition).
- **Unauthorized / Forbidden**: `401` is returned when the caller is not authenticated; `403` is returned when the caller is authenticated but lacks the required role or permission.

---

## Pagination Parameters

Reusable `PaginationRequest` object accepted as `[FromQuery]` across list endpoints.

| Field | Type | Required | Default | Constraints |
|---|---|---|---|---|
| `PageNumber` | `int` | No | `1` | Min: `1` |
| `PageSize` | `int` | No | `20` | Min: `1`, Max: `100` |
| `IsActive` | `bool?` | No | — | — |
| `SearchKeyword` | `string?` | No | — | — |

---

## ActivityLog Controller

**Base route:** `/api/activitylog`  
**Authentication:** Required

---

### `POST /api/activitylog`

**Description:** Logs a frontend route navigation event. Captures user agent details (browser, OS, device) and IP address automatically from the request context.

**Request Headers:**

| Header | Required | Description |
|---|---|---|
| `User-Agent` | Yes | Must be present and non-empty; used to parse browser, OS, and device information |

**Request Body:** `ActivityLogRequest`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `Route` | `string` | Yes | Non-empty, non-whitespace string; max 500 characters |

**Validation Rules:**

- `Route` must not be `null`, empty, or whitespace-only.
- `Route` must not exceed 500 characters.
- The authenticated user's ID must be resolvable from the JWT token.
- The `User-Agent` request header must be present and non-empty.

**Responses:**

| Status | Message |
|---|---|
| `200` | Activity log saved successfully |
| `400` | Validation failed |
| `400` | Route must not be empty or whitespace |
| `400` | User-Agent header is required |
| `400` | Business rule violation (from service layer) |
| `401` | Unauthorized |
| `409` | Business validation failed (from service layer) |
| `500` | An error occurred while saving activity log |

---

## Comments Controller

**Base route:** `/api/comments`  
**Authentication:** Required

---

### `GET /api/comments`

**Description:** Retrieves a paginated list of comments. Can be optionally filtered to a specific contribution.

**Permission Required:** `Comment.Read`

**Query Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `paginationRequest` | `PaginationRequest` | No | See [Pagination Parameters](#pagination-parameters) |
| `contributionId` | `Guid?` | No | Must not be `Guid.Empty` if provided |

**Responses:**

| Status | Message |
|---|---|
| `200` | Comments retrieved successfully |
| `400` | Validation failed / Contribution id is required |
| `500` | An error occurred while retrieving comments |

---

### `GET /api/comments/{id}`

**Description:** Retrieves a single comment by its ID.

**Permission Required:** `Comment.Read`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | Comment retrieved successfully |
| `400` | Comment id is required |
| `404` | Comment not found |
| `500` | An error occurred while retrieving comment |

---

### `GET /api/comments/contribution/{contributionId}`

**Description:** Retrieves all comments that belong to a specific contribution.

**Permission Required:** `Comment.Read`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `contributionId` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | Comments retrieved successfully |
| `400` | Contribution id is required |
| `500` | An error occurred while retrieving comments |

---

### `POST /api/comments`

**Description:** Creates a new comment on a contribution.

**Permission Required:** `Comment.Create`

**Request Body:** `CommentCreateRequest`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `ContributionId` | `Guid` | Yes | Non-empty GUID (rejects `Guid.Empty`) |
| `Comment` | `string` | Yes | Length: 1–500 characters |

**Validation Rules:**

- `ContributionId` must not be `Guid.Empty`; `[Required]` alone does not reject a default GUID.
- `Comment` must not be `null`, empty, or whitespace-only.

**Responses:**

| Status | Message |
|---|---|
| `201` | Comment created successfully |
| `400` | Validation failed |
| `400` | Contribution id is required |
| `400` | Business rule violation (from service layer) |
| `401` | Unauthorized |
| `403` | Forbidden |
| `409` | Business validation failed (e.g., commenting not allowed on this contribution) |
| `500` | An error occurred while creating comment |

---

### `PUT /api/comments/{id}`

**Description:** Updates the content or active state of an existing comment.

**Permission Required:** `Comment.Update`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Request Body:** `CommentUpdateRequest`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `Comment` | `string?` | No | Length: 1–500 characters if provided |
| `IsActive` | `bool?` | No | — |

**Responses:**

| Status | Message |
|---|---|
| `200` | Comment updated successfully |
| `400` | Comment id is required / Validation failed |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Comment not found |
| `500` | An error occurred while updating comment |

---

### `DELETE /api/comments/{id}`

**Description:** Permanently deletes a comment by its ID.

**Permission Required:** `Comment.Delete`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | Comment deleted successfully |
| `400` | Comment id is required |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Comment not found |
| `500` | An error occurred while deleting comment |

---

## Contributions Controller

**Base route:** `/api/contributions`  
**Authentication:** Required

---

### `POST /api/contributions`

**Description:** Creates a new draft contribution submitted by a student. The document file is mandatory; the image file is optional. Accepted as `multipart/form-data`.

**Role Required:** `Student`  
**Permission Required:** `Contribution.Create`  
**Content-Type:** `multipart/form-data`

**Request Body:** `ContributionCreateForm`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `ContributionWindowId` | `Guid` | Yes | Non-empty GUID (rejects `Guid.Empty`) |
| `FacultyId` | `Guid` | Yes | Non-empty GUID (rejects `Guid.Empty`) |
| `Subject` | `string` | Yes | Max: 100 characters |
| `Description` | `string` | Yes | Max: 500 characters |
| `DocumentFile` | `IFormFile` | Yes | File upload; allowed types: `.doc`, `.docx`; max size: 10 MB |
| `ImageFile` | `IFormFile?` | No | Optional image upload; allowed types: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`; max size: 5 MB |

**Validation Rules:**

- `ContributionWindowId` must not be `Guid.Empty`.
- `FacultyId` must not be `Guid.Empty`.
- `DocumentFile` must be non-empty, within 10 MB, and have a `.doc` or `.docx` extension.
- `ImageFile` (if provided) must be within 5 MB and have a `.jpg`, `.jpeg`, `.png`, `.gif`, or `.webp` extension.
- The referenced contribution window must exist and be currently open.
- The referenced faculty must exist.

**Responses:**

| Status | Message |
|---|---|
| `201` | Contribution created successfully |
| `400` | Validation failed |
| `400` | Contribution window id is required |
| `400` | Faculty id is required |
| `400` | Document/Image file validation failed (empty file, unsupported extension, file too large) |
| `401` | Unauthorized |
| `403` | Forbidden |
| `409` | Conflict (e.g., submission window is not open) |
| `500` | An error occurred while creating contribution |

---

### `PUT /api/contributions/{id}`

**Description:** Updates an existing draft contribution. Only the student owner can update their own contribution. Accepted as `multipart/form-data`.

**Role Required:** `Student`  
**Permission Required:** `Contribution.Update`  
**Content-Type:** `multipart/form-data`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Request Body:** `ContributionUpdateForm`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `Subject` | `string?` | No | Max: 100 characters if provided |
| `Description` | `string?` | No | Max: 500 characters if provided |
| `DocumentFile` | `IFormFile?` | No | Optional file replacement |
| `ImageFile` | `IFormFile?` | No | Optional image replacement |

**Responses:**

| Status | Message |
|---|---|
| `200` | Contribution updated successfully |
| `400` | Contribution id is required / Validation failed |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Contribution not found |
| `409` | Conflict (e.g., contribution is not in an editable state) |
| `500` | An error occurred while updating contribution |

---

### `GET /api/contributions/{id}`

**Description:** Retrieves the full details of a single contribution by its ID, including documents and comments.

**Permission Required:** `Contribution.Read`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | Contribution retrieved successfully |
| `400` | Contribution id is required |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Contribution not found |
| `500` | An error occurred while retrieving contribution |

---

### `GET /api/contributions/documents/{documentId}/download`

**Description:** Downloads a single contribution document as a binary file.

**Permission Required:** `Contribution.Read`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `documentId` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | File binary response (`application/octet-stream`) |
| `400` | Document id is required |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Document not found |
| `500` | An error occurred while retrieving document |

---

### `GET /api/contributions`

**Description:** Returns the authenticated user's own contributions (Student) or all faculty contributions (Coordinator). Supports optional status filter and pagination.

**Role Required:** `Student` or `Coordinator`  
**Permission Required:** `Contribution.Read`

**Query Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `paginationRequest` | `PaginationRequest` | No | See [Pagination Parameters](#pagination-parameters) |
| `status` | `string?` | No | Optional contribution status filter (e.g., `Draft`, `Submitted`, `Approved`) |

**Responses:**

| Status | Message |
|---|---|
| `200` | Contributions retrieved successfully |
| `400` | Validation failed / Invalid status filter |
| `401` | Unauthorized |
| `403` | Forbidden |
| `500` | An error occurred while retrieving contributions |

---

### `GET /api/contributions/selected`

**Description:** Retrieves the list of selected (published) contributions visible to faculty viewers. Optionally filtered by contribution window.

**Role Required:** `Manager` or `Guest`  
**Permission Required:** `Contribution.Read`

**Query Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `paginationRequest` | `PaginationRequest` | No | See [Pagination Parameters](#pagination-parameters) |
| `contributionWindowId` | `Guid?` | No | Optional window filter |

**Responses:**

| Status | Message |
|---|---|
| `200` | Selected contributions retrieved successfully |
| `400` | Validation failed |
| `401` | Unauthorized |
| `403` | Forbidden |
| `500` | An error occurred while retrieving selected contributions |

---

### `GET /api/contributions/selected/{id}/download`

**Description:** Downloads all files of a specific selected contribution as a ZIP archive. Manager only.

**Role Required:** `Manager`  
**Permission Required:** `Contribution.Read`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | ZIP file download (`application/zip`) |
| `400` | Contribution id is required |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Contribution files not found |
| `409` | Conflict (e.g., no downloadable files exist for this contribution) |
| `500` | An error occurred while retrieving selected contribution files |

---

### `POST /api/contributions/selected/download`

**Description:** Downloads all files for multiple selected contributions as a single ZIP archive. Manager only.

**Role Required:** `Manager`  
**Permission Required:** `Contribution.Read`

**Request Body:** `ContributionBulkSelectRequest`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `ContributionIds` | `List<Guid>` | Yes | Minimum 1 item |

**Responses:**

| Status | Message |
|---|---|
| `200` | ZIP file download (`application/zip`) |
| `400` | Validation failed / Invalid contribution IDs |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Contribution files not found |
| `409` | Conflict (invalid state) |
| `500` | An error occurred while retrieving selected contribution files |

---

### `PUT /api/contributions/{id}/submit`

**Description:** Submits a draft contribution for coordinator review. Only the student owner can submit.

**Role Required:** `Student`  
**Permission Required:** `Contribution.Update`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | Contribution status updated successfully |
| `400` | Contribution id is required / Validation failed |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Contribution not found |
| `409` | Conflict (e.g., already submitted or submission window is closed) |
| `500` | An error occurred while updating contribution status |

---

### `PUT /api/contributions/{id}/review`

**Description:** Marks a submitted contribution as reviewed by the coordinator.

**Role Required:** `Coordinator`  
**Permission Required:** `Contribution.Update`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | Contribution review status updated successfully |
| `400` | Contribution id is required / Validation failed |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Contribution not found |
| `409` | Conflict (e.g., contribution is not in a reviewable state) |
| `500` | An error occurred while updating contribution review status |

---

### `PUT /api/contributions/{id}/approve`

**Description:** Approves a reviewed contribution for potential selection.

**Role Required:** `Coordinator`  
**Permission Required:** `Contribution.Update`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | Contribution review status updated successfully |
| `400` | Contribution id is required / Validation failed |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Contribution not found |
| `409` | Conflict (e.g., contribution is not in an approvable state) |
| `500` | An error occurred while updating contribution review status |

---

### `PUT /api/contributions/{id}/select`

**Description:** Marks a single approved contribution as selected for publication.

**Role Required:** `Coordinator`  
**Permission Required:** `Contribution.Update`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | Contribution selection status updated successfully |
| `400` | Contribution id is required / Validation failed |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Contribution not found |
| `409` | Conflict (e.g., contribution is not in a selectable state) |
| `500` | An error occurred while updating contribution selection status |

---

### `PUT /api/contributions/select`

**Description:** Bulk-selects multiple approved contributions for publication in a single operation.

**Role Required:** `Coordinator`  
**Permission Required:** `Contribution.Update`

**Request Body:** `ContributionBulkSelectRequest`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `ContributionIds` | `List<Guid>` | Yes | Minimum 1 item |

**Responses:**

| Status | Message |
|---|---|
| `200` | Contribution selection statuses updated successfully |
| `400` | Validation failed / Invalid contribution IDs |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | One or more contributions not found |
| `409` | Conflict (invalid state) |
| `500` | An error occurred while updating contribution selection statuses |

---

### `PUT /api/contributions/{id}/reject`

**Description:** Rejects a submitted or reviewed contribution.

**Role Required:** `Coordinator`  
**Permission Required:** `Contribution.Update`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | Contribution review status updated successfully |
| `400` | Contribution id is required / Validation failed |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Contribution not found |
| `409` | Conflict (e.g., contribution cannot be rejected from its current state) |
| `500` | An error occurred while updating contribution review status |

---

### `PUT /api/contributions/{id}/request-revision`

**Description:** Sends a contribution back to the student with a request for revision.

**Role Required:** `Coordinator`  
**Permission Required:** `Contribution.Update`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | Contribution review status updated successfully |
| `400` | Contribution id is required / Validation failed |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Contribution not found |
| `409` | Conflict (e.g., contribution is not in a revisable state) |
| `500` | An error occurred while updating contribution review status |

---

## ContributionWindows Controller

**Base route:** `/api/contributionwindows`  
**Authentication:** Required

---

### `GET /api/contributionwindows/status`

**Description:** Returns the current contribution window status, indicating whether submission is open, along with the active window's date boundaries.

**Role Required:** `Student`, `Coordinator`, or `Manager`

**Responses:**

| Status | Message |
|---|---|
| `200` | Contribution window status retrieved successfully |
| `500` | An error occurred while retrieving contribution window status |

---

### `GET /api/contributionwindows`

**Description:** Retrieves a paginated list of all contribution windows.

**Permission Required:** `ContributionWindow.Read`

**Query Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `paginationRequest` | `PaginationRequest` | No | See [Pagination Parameters](#pagination-parameters) |

**Responses:**

| Status | Message |
|---|---|
| `200` | Contribution windows retrieved successfully |
| `400` | Validation failed |
| `500` | An error occurred while retrieving contribution windows |

---

### `GET /api/contributionwindows/active`

**Description:** Retrieves all currently active contribution windows without pagination.

**Permission Required:** `ContributionWindow.Read`

**Responses:**

| Status | Message |
|---|---|
| `200` | Active contribution windows retrieved successfully |
| `500` | An error occurred while retrieving active contribution windows |

---

### `GET /api/contributionwindows/{id}`

**Description:** Retrieves a single contribution window by its ID.

**Permission Required:** `ContributionWindow.Read`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | Contribution window retrieved successfully |
| `400` | Contribution window id is required |
| `404` | Contribution window not found |
| `500` | An error occurred while retrieving contribution window |

---

### `POST /api/contributionwindows`

**Description:** Creates a new contribution window defining submission and closure dates.

**Permission Required:** `ContributionWindow.Create`

**Request Body:** `ContributionWindowCreateRequest`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `SubmissionOpenDate` | `DateTime` | Yes | Valid UTC date |
| `SubmissionEndDate` | `DateTime` | Yes | Valid UTC date; must be after `SubmissionOpenDate` |
| `ClosureDate` | `DateTime` | Yes | Valid UTC date; must be on or after `SubmissionEndDate` |
| `AcademicYearStart` | `int` | Yes | Range: 1900–3000 |
| `AcademicYearEnd` | `int` | Yes | Range: 1900–3000; must be ≥ `AcademicYearStart` |

**Validation Rules:**

- `SubmissionEndDate` must be strictly after `SubmissionOpenDate`.
- `ClosureDate` must be on or after `SubmissionEndDate`.
- `AcademicYearEnd` must be greater than or equal to `AcademicYearStart`.
- All three dates must fall within the specified academic year range.
- No other contribution window may share the same academic year.

**Responses:**

| Status | Message |
|---|---|
| `201` | Contribution window created successfully |
| `400` | Validation failed |
| `400` | Submission end date must be after the submission open date |
| `400` | Closure date must be on or after the submission end date |
| `400` | Academic year end must be greater than or equal to academic year start |
| `400` | Business rule violation (from service layer) |
| `409` | Conflict (e.g., overlapping academic year window already exists; dates outside academic year range) |
| `500` | An error occurred while creating contribution window |

---

### `PUT /api/contributionwindows/{id}`

**Description:** Updates an existing contribution window's dates or active state.

**Permission Required:** `ContributionWindow.Update`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Request Body:** `ContributionWindowUpdateRequest`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `SubmissionOpenDate` | `DateTime?` | No | Valid UTC date if provided |
| `SubmissionEndDate` | `DateTime?` | No | Valid UTC date if provided; must be after `SubmissionOpenDate` when both are supplied |
| `ClosureDate` | `DateTime?` | No | Valid UTC date if provided; must be on or after `SubmissionEndDate` when both are supplied |
| `AcademicYearStart` | `int?` | No | Range: 1900–3000 if provided |
| `AcademicYearEnd` | `int?` | No | Range: 1900–3000 if provided; must be ≥ `AcademicYearStart` when both are supplied |
| `IsActive` | `bool?` | No | — |

**Validation Rules:**

- When both `SubmissionOpenDate` and `SubmissionEndDate` are provided, end must be strictly after open.
- When both `SubmissionEndDate` and `ClosureDate` are provided, closure must be on or after end.
- When both `AcademicYearStart` and `AcademicYearEnd` are provided, end must be ≥ start.
- All supplied dates must fall within the academic year range (resolved against existing or new values).

**Responses:**

| Status | Message |
|---|---|
| `200` | Contribution window updated successfully |
| `400` | Contribution window id is required / Validation failed |
| `400` | Submission end date must be after the submission open date |
| `400` | Closure date must be on or after the submission end date |
| `400` | Academic year end must be greater than or equal to academic year start |
| `400` | Business rule violation (from service layer) |
| `404` | Contribution window not found |
| `409` | Conflict (e.g., overlapping academic year window already exists; dates outside academic year range) |
| `500` | An error occurred while updating contribution window |

---

### `DELETE /api/contributionwindows/{id}`

**Description:** Deletes a contribution window by its ID.

**Permission Required:** `ContributionWindow.Delete`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | Contribution window deleted successfully |
| `400` | Contribution window id is required |
| `404` | Contribution window not found |
| `500` | An error occurred while deleting contribution window |

---

## Faculties Controller

**Base route:** `/api/faculties`  
**Authentication:** Required

---

### `GET /api/faculties`

**Description:** Retrieves a paginated list of all faculties.

**Permission Required:** `Faculty.Read`

**Query Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `paginationRequest` | `PaginationRequest` | No | See [Pagination Parameters](#pagination-parameters) |

**Responses:**

| Status | Message |
|---|---|
| `200` | Faculties retrieved successfully |
| `400` | Validation failed |
| `500` | An error occurred while retrieving faculties |

---

### `GET /api/faculties/ActiveFaculties`

**Description:** Retrieves all active faculties without pagination.

**Permission Required:** `Faculty.Read`

**Responses:**

| Status | Message |
|---|---|
| `200` | Faculties retrieved successfully |
| `500` | An error occurred while retrieving faculties |

---

### `GET /api/faculties/{id}`

**Description:** Retrieves a faculty by its ID.

**Permission Required:** `Faculty.Read`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | Faculty retrieved successfully |
| `400` | Faculty id is required |
| `404` | Faculty not found |
| `500` | An error occurred while retrieving faculty |

---

### `POST /api/faculties`

**Description:** Creates a new faculty.

**Permission Required:** `Faculty.Create`

**Request Body:** `FacultyCreateRequest`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `Name` | `string` | Yes | Length: 2–200 characters |

**Responses:**

| Status | Message |
|---|---|
| `201` | Faculty created successfully |
| `400` | Validation failed |
| `400` | Business rule violation (from service layer) |
| `409` | Conflict (e.g., faculty name already exists) |
| `500` | An error occurred while creating faculty |

---

### `PUT /api/faculties/{id}`

**Description:** Updates an existing faculty's name or active state.

**Permission Required:** `Faculty.Update`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Request Body:** `FacultyUpdateRequest`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `Name` | `string` | Yes | Length: 2–200 characters |
| `IsActive` | `bool?` | No | — |

**Responses:**

| Status | Message |
|---|---|
| `200` | Faculty updated successfully |
| `400` | Faculty id is required / Validation failed |
| `400` | Business rule violation (from service layer) |
| `404` | Faculty not found |
| `409` | Conflict (e.g., duplicate name) |
| `500` | An error occurred while updating faculty |

---

### `DELETE /api/faculties/{id}`

**Description:** Deletes a faculty by its ID.

**Permission Required:** `Faculty.Delete`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | Faculty deleted successfully |
| `400` | Faculty id is required |
| `404` | Faculty not found |
| `500` | An error occurred while deleting faculty |

---

## Permissions Controller

**Base route:** `/api/permissions`  
**Authentication:** Required

---

### `GET /api/permissions`

**Description:** Retrieves a paginated list of all permissions.

**Permission Required:** `Permission.Read`

**Query Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `paginationRequest` | `PaginationRequest` | No | See [Pagination Parameters](#pagination-parameters) |

**Responses:**

| Status | Message |
|---|---|
| `200` | Permissions retrieved successfully |
| `400` | Validation failed |
| `500` | An error occurred while retrieving permissions |

---

### `GET /api/permissions/ActivePermissions`

**Description:** Retrieves all currently active permissions without pagination.

**Permission Required:** `Permission.Read`

**Responses:**

| Status | Message |
|---|---|
| `200` | Permissions retrieved successfully |
| `500` | An error occurred while retrieving permissions |

---

### `GET /api/permissions/{id}`

**Description:** Retrieves a single permission by its ID.

**Permission Required:** `Permission.Read`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | Permission retrieved successfully |
| `400` | Permission id is required |
| `404` | Permission not found |
| `500` | An error occurred while retrieving permission |

---

### `POST /api/permissions`

**Description:** Creates a new permission entry.

**Permission Required:** `Permission.Create`

**Request Body:** `PermissionCreateRequest`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `Module` | `string` | Yes | Length: 2–50 characters |
| `Name` | `string` | Yes | Length: 2–100 characters |
| `Description` | `string?` | No | Max: 255 characters |

**Responses:**

| Status | Message |
|---|---|
| `201` | Permission created successfully |
| `400` | Validation failed |
| `400` | Business rule violation (from service layer) |
| `409` | Conflict (e.g., duplicate permission name in the same module) |
| `500` | An error occurred while creating permission |

---

### `PUT /api/permissions/{id}`

**Description:** Updates an existing permission.

**Permission Required:** `Permission.Update`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Request Body:** `PermissionUpdateRequest`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `Module` | `string?` | No | Length: 2–50 characters if provided |
| `Name` | `string?` | No | Length: 2–100 characters if provided |
| `Description` | `string?` | No | Max: 255 characters if provided |
| `IsActive` | `bool?` | No | — |

**Responses:**

| Status | Message |
|---|---|
| `200` | Permission updated successfully |
| `400` | Permission id is required / Validation failed |
| `400` | Business rule violation (from service layer) |
| `404` | Permission not found |
| `409` | Conflict (e.g., duplicate name) |
| `500` | An error occurred while updating permission |

---

### `DELETE /api/permissions/{id}`

**Description:** Deletes a permission by its ID.

**Permission Required:** `Permission.Delete`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | Permission deleted successfully |
| `400` | Permission id is required |
| `404` | Permission not found |
| `500` | An error occurred while deleting permission |

---

## Report Controller

**Base route:** `/api/report`  
**Authentication:** Required

---

### `GET /api/report/browser-list`

**Description:** Returns an aggregated report of browser usage across all tracked activity logs.

**Role Required:** `Admin`

**Responses:**

| Status | Message |
|---|---|
| `200` | Browser list retrieved successfully |
| `400` | Business rule violation (from service layer) |
| `401` | Unauthorized |
| `403` | Forbidden — caller does not have the `Admin` role |
| `409` | Business validation failed (from service layer) |
| `500` | An error occurred while retrieving browser list report |

---

### `GET /api/report/contribution-count-by-faculty`

**Description:** Returns the total number of contributions grouped by faculty and academic year.

**Role Required:** `Manager`

**Responses:**

| Status | Message |
|---|---|
| `200` | Contribution count by faculty and academic year retrieved successfully |
| `400` | Business rule violation (from service layer) |
| `401` | Unauthorized |
| `403` | Forbidden — caller does not have the `Manager` role |
| `409` | Business validation failed (from service layer) |
| `500` | An error occurred while retrieving contribution count by faculty report |

---

### `GET /api/report/contribution-percentage-by-faculty`

**Description:** Returns the percentage breakdown of contributions grouped by faculty and academic year.

**Role Required:** `Manager`

**Responses:**

| Status | Message |
|---|---|
| `200` | Contribution percentage by faculty and academic year retrieved successfully |
| `400` | Business rule violation (from service layer) |
| `401` | Unauthorized |
| `403` | Forbidden — caller does not have the `Manager` role |
| `409` | Business validation failed (from service layer) |
| `500` | An error occurred while retrieving contribution percentage by faculty report |

---

### `GET /api/report/contributions-without-comment`

**Description:** Returns a paginated list of contributions that have received no coordinator comments.

**Query Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `paginationRequest` | `PaginationRequest` | No | See [Pagination Parameters](#pagination-parameters) |

**Responses:**

| Status | Message |
|---|---|
| `200` | Contributions without comment retrieved successfully |
| `400` | Business rule violation (from service layer) |
| `409` | Business validation failed (from service layer) |
| `500` | An error occurred while retrieving contributions without comment report |

---

### `GET /api/report/contributions-without-comment-after-14-days`

**Description:** Returns a paginated list of contributions that have had no coordinator comment for more than 14 days after submission.

**Query Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `paginationRequest` | `PaginationRequest` | No | See [Pagination Parameters](#pagination-parameters) |

**Responses:**

| Status | Message |
|---|---|
| `200` | Contributions without comment after 14 days retrieved successfully |
| `400` | Business rule violation (from service layer) |
| `409` | Business validation failed (from service layer) |
| `500` | An error occurred while retrieving contributions without comment after 14 days report |

---

### `GET /api/report/page-access-count`

**Description:** Returns a count report of page access events logged across the system.

**Role Required:** `Admin`

**Responses:**

| Status | Message |
|---|---|
| `200` | Page access count retrieved successfully |
| `400` | Business rule violation (from service layer) |
| `401` | Unauthorized |
| `403` | Forbidden — caller does not have the `Admin` role |
| `409` | Business validation failed (from service layer) |
| `500` | An error occurred while retrieving page access count report |

---

### `GET /api/report/user-activity-count`

**Description:** Returns a count report of all user activity events.

**Role Required:** `Admin`

**Responses:**

| Status | Message |
|---|---|
| `200` | User activity count retrieved successfully |
| `400` | Business rule violation (from service layer) |
| `401` | Unauthorized |
| `403` | Forbidden — caller does not have the `Admin` role |
| `409` | Business validation failed (from service layer) |
| `500` | An error occurred while retrieving user activity count report |

---

### `GET /api/report/my-contribution-status-count`

**Description:** Returns contribution counts grouped by status for the currently authenticated user.

**Role Required:** `Coordinator` or `Student`

**Limitations:** A valid user ID must be present in the JWT token.

**Responses:**

| Status | Message |
|---|---|
| `200` | Contribution status count retrieved successfully |
| `400` | Business rule violation (from service layer) |
| `401` | Unauthorized |
| `403` | Forbidden — caller does not have the `Coordinator` or `Student` role |
| `409` | Business validation failed (from service layer) |
| `500` | An error occurred while retrieving contribution status count report |

---

### `GET /api/report/faculty-contribution-status-count`

**Description:** Returns contribution counts grouped by status for each faculty.

**Role Required:** `Manager`

**Responses:**

| Status | Message |
|---|---|
| `200` | Faculty contribution status count retrieved successfully |
| `400` | Business rule violation (from service layer) |
| `401` | Unauthorized |
| `403` | Forbidden — caller does not have the `Manager` role |
| `409` | Business validation failed (from service layer) |
| `500` | An error occurred while retrieving faculty contribution status count report |

---

### `GET /api/report/faculty-user-count`

**Description:** Returns the total number of registered users per faculty.

**Role Required:** `Admin` or `Manager`

**Responses:**

| Status | Message |
|---|---|
| `200` | Faculty user count retrieved successfully |
| `400` | Business rule violation (from service layer) |
| `401` | Unauthorized |
| `403` | Forbidden — caller does not have the `Admin` or `Manager` role |
| `409` | Business validation failed (from service layer) |
| `500` | An error occurred while retrieving faculty user count report |

---

### `GET /api/report/my-faculty-student-count`

**Description:** Returns the student count per faculty for the faculties assigned to the currently authenticated coordinator.

**Role Required:** `Coordinator`

**Limitations:** The authenticated user must have at least one faculty assigned; otherwise `400` is returned.

**Responses:**

| Status | Message |
|---|---|
| `200` | Faculty student count retrieved successfully |
| `400` | No faculties assigned to current user |
| `400` | Business rule violation (from service layer) |
| `401` | Unauthorized |
| `403` | Forbidden — caller does not have the `Coordinator` role |
| `409` | Business validation failed (from service layer) |
| `500` | An error occurred while retrieving faculty student count report |

---

### `GET /api/report/top-contributors`

**Description:** Returns the top contributors by submission count, optionally scoped to a specific contribution window.

**Query Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `contributionWindowId` | `Guid?` | No | Must not be `Guid.Empty` if provided |

**Validation Rules:**

- If `contributionWindowId` is provided, it must not be `Guid.Empty`.

**Responses:**

| Status | Message |
|---|---|
| `200` | Top contributors retrieved successfully |
| `400` | Contribution window id is required |
| `400` | Business rule violation (from service layer) |
| `409` | Business validation failed (from service layer) |
| `500` | An error occurred while retrieving top contributors report |

---

## Roles Controller

**Base route:** `/api/roles`  
**Authentication:** Required

---

### `GET /api/roles`

**Description:** Retrieves a paginated list of all roles including their assigned permissions.

**Permission Required:** `Role.Read`

**Query Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `paginationRequest` | `PaginationRequest` | No | See [Pagination Parameters](#pagination-parameters) |

**Responses:**

| Status | Message |
|---|---|
| `200` | Roles retrieved successfully |
| `400` | Validation failed |
| `500` | An error occurred while retrieving roles |

---

### `GET /api/roles/{id}`

**Description:** Retrieves a single role by its ID.

**Permission Required:** `Role.Read`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | Role retrieved successfully |
| `400` | Role id is required |
| `404` | Role not found |
| `500` | An error occurred while retrieving role |

---

### `GET /api/roles/ActiveRoles`

**Description:** Retrieves all currently active roles without pagination.

**Permission Required:** `Role.Read`

**Responses:**

| Status | Message |
|---|---|
| `200` | Role retrieved successfully |
| `500` | An error occurred while retrieving roles |

---

### `POST /api/roles`

**Description:** Creates a new role and optionally assigns permissions to it.

**Permission Required:** `Role.Create`

**Request Body:** `RoleCreateRequest`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `Name` | `string` | Yes | Length: 2–100 characters |
| `Description` | `string?` | No | Max: 255 characters |
| `PermissionIds` | `List<Guid>?` | No | List of permission GUIDs to assign |

**Responses:**

| Status | Message |
|---|---|
| `201` | Role created successfully |
| `400` | Validation failed |
| `400` | Business rule violation (from service layer) |
| `409` | Conflict (e.g., role name already exists) |
| `500` | An error occurred while creating role |

---

### `PUT /api/roles/{id}`

**Description:** Updates an existing role's name, description, active state, or permission assignments.

**Permission Required:** `Role.Update`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Request Body:** `RoleUpdateRequest`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `Name` | `string?` | No | Length: 2–100 characters if provided |
| `Description` | `string?` | No | Max: 255 characters if provided |
| `IsActive` | `bool?` | No | — |
| `PermissionIds` | `List<Guid>?` | No | Replaces the full list of assigned permissions |

**Responses:**

| Status | Message |
|---|---|
| `200` | Role updated successfully |
| `400` | Role id is required / Validation failed |
| `400` | Business rule violation (from service layer) |
| `404` | Role not found |
| `409` | Conflict (e.g., duplicate name) |
| `500` | An error occurred while updating role |

---

### `DELETE /api/roles/{id}`

**Description:** Deletes a role by its ID.

**Permission Required:** `Role.Delete`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | Role deleted successfully |
| `400` | Role id is required |
| `404` | Role not found |
| `500` | An error occurred while deleting role |

---

## Users Controller

**Base route:** `/api/users`  
**Authentication:** Required (except `POST /login` and `POST /refresh-token`)

---

### `GET /api/users`

**Description:** Retrieves a paginated list of all registered users including their role and faculty assignments.

**Permission Required:** `User.Read`

**Query Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `paginationRequest` | `PaginationRequest` | No | See [Pagination Parameters](#pagination-parameters) |

**Responses:**

| Status | Message |
|---|---|
| `200` | Users retrieved successfully |
| `400` | Validation failed |
| `500` | An error occurred while retrieving users |

---

### `GET /api/users/{id}`

**Description:** Retrieves a single user by their ID.

**Permission Required:** `User.Read`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | User retrieved successfully |
| `400` | User id is required |
| `404` | User not found |
| `500` | An error occurred while retrieving user |

---

### `POST /api/users/login`

**Description:** Authenticates a user with their login ID and password and returns a JWT access token and refresh token.

**Authentication:** None (`[AllowAnonymous]`)

**Request Body:** `UserLoginRequest`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `LoginId` | `string` | Yes | Non-empty string |
| `Password` | `string` | Yes | Non-empty string |

**Responses:**

| Status | Message |
|---|---|
| `200` | Login successful |
| `400` | Validation failed |
| `401` | Invalid credentials |
| `500` | An error occurred while logging in |

---

### `GET /api/users/profile`

**Description:** Returns the profile of the currently authenticated user, including last login date and first-time login flag.

**Limitations:** A valid user ID must be present in the JWT token.

**Responses:**

| Status | Message |
|---|---|
| `200` | Profile retrieved successfully |
| `401` | Unauthorized |
| `404` | User not found |
| `500` | An error occurred while retrieving profile |

---

### `POST /api/users/refresh-token`

**Description:** Issues a new JWT access token and refresh token using a valid, non-expired refresh token.

**Authentication:** None (`[AllowAnonymous]`)

**Request Body:** `RefreshTokenRequest`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `RefreshToken` | `string` | Yes | Non-empty string |

**Responses:**

| Status | Message |
|---|---|
| `200` | Token refreshed successfully |
| `400` | Validation failed |
| `401` | Invalid or expired refresh token |
| `500` | An error occurred while refreshing the token |

---

### `POST /api/users`

**Description:** Registers a new user in the system with a role and optional faculty assignments.

**Permission Required:** `User.Create`

**Request Body:** `UserRegisterRequest`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `LoginId` | `string` | Yes | Length: 3–100 characters |
| `Password` | `string` | Yes | Length: 8–50 chars; must contain at least one uppercase letter (A–Z), one lowercase letter (a–z), one digit (0–9), and one special character (`@$!%*?&#^()_+-=[]{}|;:,.<>`) |
| `FullName` | `string` | Yes | Max: 200 characters |
| `Email` | `string` | Yes | Valid email address format |
| `RoleId` | `Guid` | Yes | Valid, non-empty role GUID |
| `FacultyIds` | `List<Guid>?` | No | Optional list of faculty GUIDs to assign |

**Responses:**

| Status | Message |
|---|---|
| `201` | User created successfully |
| `400` | Validation failed |
| `400` | Business rule violation (from service layer) |
| `404` | Referenced role or faculty not found |
| `409` | Conflict (e.g., login ID or email already in use) |
| `500` | An error occurred while creating user |

---

### `PUT /api/users/{id}`

**Description:** Updates an existing user's details, role, or faculty assignments.

**Permission Required:** `User.Update`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Request Body:** `UserUpdateRequest`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `LoginId` | `string?` | No | Length: 3–100 characters if provided |
| `Password` | `string?` | No | Length: 8–50 chars; must contain uppercase, lowercase, digit, and special character if provided |
| `FullName` | `string?` | No | Max: 200 characters if provided |
| `Email` | `string?` | No | Valid email address format if provided |
| `IsActive` | `bool?` | No | — |
| `RoleId` | `Guid?` | No | Valid, non-empty role GUID if provided |
| `FacultyIds` | `List<Guid>?` | No | Replaces the full list of faculty assignments |

**Responses:**

| Status | Message |
|---|---|
| `200` | User updated successfully |
| `400` | User id is required / Validation failed |
| `400` | Business rule violation (from service layer) |
| `404` | User not found |
| `404` | Referenced role or faculty not found |
| `409` | Conflict (e.g., login ID or email already in use) |
| `500` | An error occurred while updating user |

---

### `DELETE /api/users/{id}`

**Description:** Deletes a user by their ID.

**Permission Required:** `User.Delete`

**Path Parameters:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `Guid` | Yes | Must not be `Guid.Empty` |

**Responses:**

| Status | Message |
|---|---|
| `200` | User deleted successfully |
| `400` | User id is required |
| `404` | User not found |
| `500` | An error occurred while deleting user |

---

### `PATCH /api/users/change-password`

**Description:** Changes the password of the currently authenticated user. Requires the current password for verification.

**Limitations:** A valid user ID must be present in the JWT token.

**Request Body:** `ChangePasswordRequest`

| Field | Type | Required | Constraints |
|---|---|---|---|
| `CurrentPassword` | `string` | Yes | Non-empty string |
| `NewPassword` | `string` | Yes | Length: 8–50 chars; must contain at least one uppercase letter (A–Z), one lowercase letter (a–z), one digit (0–9), and one special character (`@$!%*?&#^()_+-=[]{}|;:,.<>`) |

**Responses:**

| Status | Message |
|---|---|
| `200` | Password changed successfully |
| `400` | Validation failed / Incorrect current password |
| `401` | Unauthorized |
| `500` | An error occurred while changing the password |
