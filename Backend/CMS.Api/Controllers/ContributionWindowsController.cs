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
    public class ContributionWindowsController : ControllerBase
    {
        private readonly ILogger<ContributionWindowsController> _logger;
        private readonly IContributionWindowsService _contributionWindowsService;

        public ContributionWindowsController(
            ILogger<ContributionWindowsController> logger,
            IContributionWindowsService contributionWindowsService)
        {
            _logger = logger;
            _contributionWindowsService = contributionWindowsService;
        }

        [HttpGet("status")]
        [Authorize(Roles = "Student, Coordinator, Manager")]
        public async Task<IActionResult> GetCurrentWindowStatus()
        {
            try
            {
                var status = await _contributionWindowsService.GetCurrentWindowStatusAsync();
                return status.ToApiResponse(ApiResponseMessages.Retrieved("Contribution window status"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contribution window status");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("contribution window status"), 500);
            }
        }

        [HttpGet]
        [HasPermission(PermissionNames.ContributionWindowRead)]
        public async Task<IActionResult> GetAllContributionWindows([FromQuery] PaginationRequest? paginationRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                paginationRequest ??= new PaginationRequest();

                var contributionWindows = await _contributionWindowsService.GetAllContributionWindowsAsync(paginationRequest);
                return contributionWindows.ToApiResponse(ApiResponseMessages.Retrieved("Contribution windows"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contribution windows");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("contribution windows"), 500);
            }
        }

        [HttpGet("active")]
        [HasPermission(PermissionNames.ContributionWindowRead)]
        public async Task<IActionResult> GetAllActiveContributionWindows()
        {
            try
            {
                var contributionWindows = await _contributionWindowsService.GetAllActiveContributionWindowsAsync();
                return contributionWindows.ToApiResponse(ApiResponseMessages.Retrieved("Active contribution windows"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active contribution windows");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("active contribution windows"), 500);
            }
        }

        [HttpGet("{id:guid}")]
        [HasPermission(PermissionNames.ContributionWindowRead)]
        public async Task<IActionResult> GetContributionWindowById(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Contribution window"), 400);
                }

                var contributionWindow = await _contributionWindowsService.GetContributionWindowByIdAsync(id);
                if (contributionWindow == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Contribution window"), 404);
                }

                return contributionWindow.ToApiResponse(ApiResponseMessages.Retrieved("Contribution window"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contribution window {ContributionWindowId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("contribution window"), 500);
            }
        }

        [HttpPost]
        [HasPermission(PermissionNames.ContributionWindowCreate)]
        public async Task<IActionResult> CreateContributionWindow(ContributionWindowCreateRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var createdContributionWindow = await _contributionWindowsService.CreateContributionWindowAsync(request);
                return createdContributionWindow.ToApiResponse(ApiResponseMessages.Created("Contribution window"), 201);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while creating contribution window");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating contribution window");
                return this.ToErrorResponse(ApiResponseMessages.ErrorCreating("contribution window"), 500);
            }
        }

        [HttpPut("{id:guid}")]
        [HasPermission(PermissionNames.ContributionWindowUpdate)]
        public async Task<IActionResult> UpdateContributionWindow(Guid id, ContributionWindowUpdateRequest request)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Contribution window"), 400);
                }

                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var updatedContributionWindow = await _contributionWindowsService.UpdateContributionWindowAsync(id, request);
                if (updatedContributionWindow == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Contribution window"), 404);
                }

                return updatedContributionWindow.ToApiResponse(ApiResponseMessages.Updated("Contribution window"));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while updating contribution window {ContributionWindowId}", id);
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating contribution window {ContributionWindowId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorUpdating("contribution window"), 500);
            }
        }

        [HttpDelete("{id:guid}")]
        [HasPermission(PermissionNames.ContributionWindowDelete)]
        public async Task<IActionResult> DeleteContributionWindow(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Contribution window"), 400);
                }

                var deleted = await _contributionWindowsService.DeleteContributionWindowAsync(id);
                if (!deleted)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Contribution window"), 404);
                }

                return this.ToSuccessResponse(ApiResponseMessages.Deleted("Contribution window"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting contribution window {ContributionWindowId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorDeleting("contribution window"), 500);
            }
        }
    }
}
