using CMS.Api.Models;
using CMS.Api.Utilities;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
