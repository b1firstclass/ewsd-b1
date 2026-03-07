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




        [HasPermission(PermissionNames.ContributionUpdate)]
        [HttpPut("{id:guid}/status")]
        public async Task<IActionResult> UpdateContributionStatus(Guid id, ContributionStatusUpdateRequest request)
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

                var updated = await _contributionsService.UpdateContributionStatusAsync(id, request);
                if (updated == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Contribution"), 404);
                }

                return updated.ToApiResponse(ApiResponseMessages.Updated("Contribution status"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Contribution status validation failed for contribution {ContributionId}", id);
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Contribution status update failed for contribution {ContributionId}", id);
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating contribution status {ContributionId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorUpdating("contribution status"), 500);
            }
        }

        [HasPermission(PermissionNames.ContributionRead)]
        [HttpGet("status/{status}")]
        public async Task<IActionResult> GetContributionsByStatus(string status)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(status))
                {
                    return this.ToErrorResponse("Status is required", 400);
                }

                var contributions = await _contributionsService.GetContributionsByStatusAsync(status);
                return contributions.ToApiResponse(ApiResponseMessages.Retrieved("Contributions"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Contribution status filter validation failed");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Contribution status filter validation failed");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (UnauthorizedAccessException ex)
            {
                var statusCode = ex.Message.Equals("Forbidden", StringComparison.OrdinalIgnoreCase) ? 403 : 401;
                return this.ToErrorResponse(ex.Message, statusCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contributions by status {Status}", status);
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("contributions"), 500);
            }
        }

        [HasPermission(PermissionNames.ContributionRead)]
        [HttpGet("files")]
        public async Task<IActionResult> DownloadAllContributionFiles()
        {
            try
            {
                var download = await _contributionsService.DownloadAllContributionFilesAsync();
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading all contribution files");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("contribution files"), 500);
            }
        }

        [HasPermission(PermissionNames.ContributionRead)]
        [HttpGet("{id:guid}/files")]
        public async Task<IActionResult> DownloadContributionFiles(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Contribution"), 400);
                }

                var download = await _contributionsService.DownloadContributionFilesAsync(id);
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading contribution files {ContributionId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("contribution files"), 500);
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
