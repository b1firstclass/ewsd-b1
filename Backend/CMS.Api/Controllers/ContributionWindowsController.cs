using System;
using CMS.Api.Utilities;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
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

        [HttpGet]
        public async Task<IActionResult> GetAllContributionWindows([FromQuery] PaginationRequest? paginationRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse("Validation failed", 400, ModelState);
                }

                paginationRequest ??= new PaginationRequest();

                var contributionWindows = await _contributionWindowsService.GetAllContributionWindowsAsync(paginationRequest);
                return contributionWindows.ToApiResponse("Contribution windows retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contribution windows");
                return this.ToErrorResponse("An error occurred while retrieving contribution windows", 500);
            }
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetContributionWindowById(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse("Contribution window id is required", 400);
                }

                var contributionWindow = await _contributionWindowsService.GetContributionWindowByIdAsync(id);
                if (contributionWindow == null)
                {
                    return this.ToErrorResponse("Contribution window not found", 404);
                }

                return contributionWindow.ToApiResponse("Contribution window retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contribution window {ContributionWindowId}", id);
                return this.ToErrorResponse("An error occurred while retrieving the contribution window", 500);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateContributionWindow(ContributionWindowCreateRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse("Validation failed", 400, ModelState);
                }

                var createdContributionWindow = await _contributionWindowsService.CreateContributionWindowAsync(request);
                return createdContributionWindow.ToApiResponse("Contribution window created successfully", 201);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while creating contribution window");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating contribution window");
                return this.ToErrorResponse("An error occurred while creating the contribution window", 500);
            }
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateContributionWindow(Guid id, ContributionWindowUpdateRequest request)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse("Contribution window id is required", 400);
                }

                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse("Validation failed", 400, ModelState);
                }

                var updatedContributionWindow = await _contributionWindowsService.UpdateContributionWindowAsync(id, request);
                if (updatedContributionWindow == null)
                {
                    return this.ToErrorResponse("Contribution window not found", 404);
                }

                return updatedContributionWindow.ToApiResponse("Contribution window updated successfully");
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while updating contribution window {ContributionWindowId}", id);
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating contribution window {ContributionWindowId}", id);
                return this.ToErrorResponse("An error occurred while updating the contribution window", 500);
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteContributionWindow(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse("Contribution window id is required", 400);
                }

                var deleted = await _contributionWindowsService.DeleteContributionWindowAsync(id);
                if (!deleted)
                {
                    return this.ToErrorResponse("Contribution window not found", 404);
                }

                return this.ToSuccessResponse("Contribution window deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting contribution window {ContributionWindowId}", id);
                return this.ToErrorResponse("An error occurred while deleting the contribution window", 500);
            }
        }
    }
}
