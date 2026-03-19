using CMS.Api.Models;
using CMS.Api.Security;
using CMS.Api.Utilities;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ContributionsController : ControllerBase
    {
        private readonly ILogger<ContributionsController> _logger;
        private readonly IContributionsService _contributionsService;

        public ContributionsController(
            ILogger<ContributionsController> logger,
            IContributionsService contributionsService)
        {
            _logger = logger;
            _contributionsService = contributionsService;
        }

        [Authorize(Roles = RoleNames.Student)]
        [HasPermission(PermissionNames.ContributionCreate)]
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateContribution([FromForm] ContributionCreateForm request, CancellationToken cancellationToken)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var createRequest = new ContributionCreateRequest
                {
                    ContributionWindowId = request.ContributionWindowId,
                    FacultyId = request.FacultyId,
                    Subject = request.Subject,
                    Description = request.Description,
                    DocumentFile = await MapFileAsync(request.DocumentFile, cancellationToken),
                    ImageFile = request.ImageFile == null ? null : await MapFileAsync(request.ImageFile, cancellationToken)
                };

                var response = await _contributionsService.CreateContributionAsync(createRequest);
                return response.ToApiResponse(ApiResponseMessages.Created("Contribution"), 201);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Contribution validation failed while creating contribution");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while creating contribution");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating contribution");
                return this.ToErrorResponse(ApiResponseMessages.ErrorCreating("contribution"), 500);
            }
        }

        [Authorize(Roles = RoleNames.Student)]
        [HasPermission(PermissionNames.ContributionUpdate)]
        [HttpPut("{id:guid}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateContribution(Guid id, [FromForm] ContributionUpdateForm request, CancellationToken cancellationToken)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Contribution"), 400);
                }

                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var updateRequest = new ContributionUpdateRequest
                {
                    Subject = request.Subject,
                    Description = request.Description,
                    DocumentFile = request.DocumentFile == null ? null : await MapFileAsync(request.DocumentFile, cancellationToken),
                    ImageFile = request.ImageFile == null ? null : await MapFileAsync(request.ImageFile, cancellationToken)
                };

                var updated = await _contributionsService.UpdateContributionAsync(id, updateRequest);
                if (updated == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Contribution"), 404);
                }

                return updated.ToApiResponse(ApiResponseMessages.Updated("Contribution"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Contribution validation failed while updating contribution {ContributionId}", id);
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while updating contribution {ContributionId}", id);
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating contribution {ContributionId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorUpdating("contribution"), 500);
            }
        }

        [HasPermission(PermissionNames.ContributionRead)]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetContributionById(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Contribution"), 400);
                }

                var contribution = await _contributionsService.GetContributionByIdAsync(id);
                if (contribution == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Contribution"), 404);
                }

                return contribution.ToApiResponse(ApiResponseMessages.Retrieved("Contribution"));
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contribution {ContributionId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("contribution"), 500);
            }
        }

        [HasPermission(PermissionNames.ContributionRead)]
        [HttpGet("documents/{documentId:guid}/download")]
        public async Task<IActionResult> DownloadDocument(Guid documentId)
        {
            try
            {
                if (documentId == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Document"), 400);
                }

                var download = await _contributionsService.DownloadDocumentByIdAsync(documentId);
                if (download == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Document"), 404);
                }

                return File(download.Data, download.ContentType, download.FileName);
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading document {DocumentId}", documentId);
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("document"), 500);
            }
        }

        [HasPermission(PermissionNames.ContributionRead)]
        [HttpGet]
        public async Task<IActionResult> GetMyContributions([FromQuery] PaginationRequest? paginationRequest, [FromQuery] string? status)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                paginationRequest ??= new PaginationRequest();

                var contributions = await _contributionsService.GetMyContributionsAsync(paginationRequest, status);
                return contributions.ToApiResponse(ApiResponseMessages.Retrieved("Contributions"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Contribution filter validation failed");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Contribution filter validation failed");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user contributions");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("contributions"), 500);
            }
        }

        [Authorize(Roles = RoleNames.Manager + "," + RoleNames.Guest)]
        [HasPermission(PermissionNames.ContributionRead)]
        [HttpGet("selected")]
        public async Task<IActionResult> GetSelectedContributions([FromQuery] PaginationRequest? paginationRequest, [FromQuery] Guid? contributionWindowId)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                paginationRequest ??= new PaginationRequest();

                var contributions = await _contributionsService.GetSelectedContributionsForFacultyViewerAsync(paginationRequest, contributionWindowId);
                return contributions.ToApiResponse(ApiResponseMessages.Retrieved("Selected contributions"));
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving selected contributions for manager/guest");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("selected contributions"), 500);
            }
        }

        [Authorize(Roles = RoleNames.Manager)]
        [HasPermission(PermissionNames.ContributionRead)]
        [HttpGet("selected/{id:guid}/download")]
        public async Task<IActionResult> DownloadSelectedContribution(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Contribution"), 400);
                }

                var download = await _contributionsService.DownloadSelectedContributionFilesForManagerAsync(id);
                if (download == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Contribution files"), 404);
                }

                return File(download.Data, download.ContentType, download.FileName);
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Selected contribution download validation failed for contribution {ContributionId}", id);
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading selected contribution files {ContributionId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("selected contribution files"), 500);
            }
        }

        [Authorize(Roles = RoleNames.Manager)]
        [HasPermission(PermissionNames.ContributionRead)]
        [HttpPost("selected/download")]
        public async Task<IActionResult> DownloadSelectedContributions([FromBody] ContributionBulkSelectRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var download = await _contributionsService.DownloadSelectedContributionsFilesForManagerAsync(request.ContributionIds);
                if (download == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Contribution files"), 404);
                }

                return File(download.Data, download.ContentType, download.FileName);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Selected contributions download validation failed");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Selected contributions download failed due to missing contribution");
                return this.ToErrorResponse(ex.Message, 404);
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Selected contributions download failed due to invalid state");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading selected contributions files");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("selected contribution files"), 500);
            }
        }

        [Authorize(Roles = RoleNames.Student)]
        [HasPermission(PermissionNames.ContributionUpdate)]
        [HttpPut("{id:guid}/submit")]
        public async Task<IActionResult> SubmitContribution(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Contribution"), 400);
                }

                var submitted = await _contributionsService.SubmitContributionAsync(id);
                if (submitted == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Contribution"), 404);
                }

                return submitted.ToApiResponse(ApiResponseMessages.Updated("Contribution status"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Contribution submission validation failed for contribution {ContributionId}", id);
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Contribution submission failed for contribution {ContributionId}", id);
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting contribution {ContributionId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorUpdating("contribution status"), 500);
            }
        }

        [Authorize(Roles = RoleNames.Coordinator)]
        [HasPermission(PermissionNames.ContributionUpdate)]
        [HttpPut("{id:guid}/review")]
        public async Task<IActionResult> ReviewContribution(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Contribution"), 400);
                }

                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var updated = await _contributionsService.ReviewedContributionAsync(id);
                if (updated == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Contribution"), 404);
                }

                return updated.ToApiResponse(ApiResponseMessages.Updated("Contribution review status"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Contribution review validation failed for contribution {ContributionId}", id);
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Contribution review failed for contribution {ContributionId}", id);
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reviewing contribution {ContributionId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorUpdating("contribution review status"), 500);
            }
        }

        [Authorize(Roles = RoleNames.Coordinator)]
        [HasPermission(PermissionNames.ContributionUpdate)]
        [HttpPut("{id:guid}/approve")]
        public async Task<IActionResult> ApproveContribution(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Contribution"), 400);
                }

                var updated = await _contributionsService.ApprovedContributionAsync(id);
                if (updated == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Contribution"), 404);
                }

                return updated.ToApiResponse(ApiResponseMessages.Updated("Contribution review status"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Contribution approval validation failed for contribution {ContributionId}", id);
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Contribution approval failed for contribution {ContributionId}", id);
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving contribution {ContributionId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorUpdating("contribution review status"), 500);
            }
        }

        [Authorize(Roles = RoleNames.Coordinator)]
        [HasPermission(PermissionNames.ContributionUpdate)]
        [HttpPut("{id:guid}/select")]
        public async Task<IActionResult> SelectContribution(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Contribution"), 400);
                }

                var updated = await _contributionsService.SelectedContributionAsync(id);
                if (updated == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Contribution"), 404);
                }

                return updated.ToApiResponse(ApiResponseMessages.Updated("Contribution selection status"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Contribution selection validation failed for contribution {ContributionId}", id);
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Contribution selection failed for contribution {ContributionId}", id);
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error selecting contribution {ContributionId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorUpdating("contribution selection status"), 500);
            }
        }

        [Authorize(Roles = RoleNames.Coordinator)]
        [HasPermission(PermissionNames.ContributionUpdate)]
        [HttpPut("select")]
        public async Task<IActionResult> SelectContributions([FromBody] ContributionBulkSelectRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var updated = await _contributionsService.SelectedContributionsAsync(request.ContributionIds);
                return updated.ToApiResponse(ApiResponseMessages.Updated("Contribution selection statuses"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Bulk contribution selection validation failed");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Bulk contribution selection failed due to missing contribution");
                return this.ToErrorResponse(ex.Message, 404);
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Bulk contribution selection failed due to invalid state");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error selecting contributions in bulk");
                return this.ToErrorResponse(ApiResponseMessages.ErrorUpdating("contribution selection statuses"), 500);
            }
        }

        [Authorize(Roles = RoleNames.Coordinator)]
        [HasPermission(PermissionNames.ContributionUpdate)]
        [HttpPut("{id:guid}/reject")]
        public async Task<IActionResult> RejectContribution(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Contribution"), 400);
                }

                var updated = await _contributionsService.RejectedContributionAsync(id);
                if (updated == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Contribution"), 404);
                }

                return updated.ToApiResponse(ApiResponseMessages.Updated("Contribution review status"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Contribution rejection validation failed for contribution {ContributionId}", id);
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Contribution rejection failed for contribution {ContributionId}", id);
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting contribution {ContributionId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorUpdating("contribution review status"), 500);
            }
        }

        [Authorize(Roles = RoleNames.Coordinator)]
        [HasPermission(PermissionNames.ContributionUpdate)]
        [HttpPut("{id:guid}/request-revision")]
        public async Task<IActionResult> RequestContributionRevision(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Contribution"), 400);
                }

                var updated = await _contributionsService.RequestRevisionContributionAsync(id);
                if (updated == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Contribution"), 404);
                }

                return updated.ToApiResponse(ApiResponseMessages.Updated("Contribution review status"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Contribution revision request validation failed for contribution {ContributionId}", id);
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Contribution revision request failed for contribution {ContributionId}", id);
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error requesting revision for contribution {ContributionId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorUpdating("contribution review status"), 500);
            }
        }

        private static async Task<ContributionFileRequest> MapFileAsync(IFormFile file, CancellationToken cancellationToken)
        {
            await using var stream = new MemoryStream();
            await file.CopyToAsync(stream, cancellationToken);

            return new ContributionFileRequest
            {
                FileName = file.FileName,
                Data = stream.ToArray(),
                Size = file.Length
            };
        }
    }
}
