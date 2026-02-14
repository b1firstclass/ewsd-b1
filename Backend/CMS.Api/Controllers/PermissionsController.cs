using CMS.Api.Utilities;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PermissionsController : ControllerBase
    {
        private readonly ILogger<PermissionsController> _logger;
        private readonly IPermissionsService _permissionsService;

        public PermissionsController(ILogger<PermissionsController> logger, IPermissionsService permissionsService)
        {
            _logger = logger;
            _permissionsService = permissionsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPermissions()
        {
            try
            {
                var permissions = await _permissionsService.GetAllPermissionsAsync();
                var response = new PagedResponse<PermissionInfo>(permissions, permissions.Count);
                return response.ToApiResponse("Permissions retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving permissions");
                return this.ToErrorResponse("An error occurred while retrieving permissions", 500);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPermissionById(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    return this.ToErrorResponse("Permission id is required", 400);
                }

                var permission = await _permissionsService.GetPermissionByIdAsync(id);
                if (permission == null)
                {
                    return this.ToErrorResponse("Permission not found", 404);
                }

                return permission.ToApiResponse("Permission retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving permission {PermissionId}", id);
                return this.ToErrorResponse("An error occurred while retrieving the permission", 500);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreatePermission(PermissionCreateRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse("Validation failed", 400, ModelState);
                }

                var createdPermission = await _permissionsService.CreatePermissionAsync(request);
                return createdPermission.ToApiResponse("Permission created successfully", 201);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while creating permission");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating permission");
                return this.ToErrorResponse("An error occurred while creating the permission", 500);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePermission(string id, PermissionUpdateRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    return this.ToErrorResponse("Permission id is required", 400);
                }

                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse("Validation failed", 400, ModelState);
                }

                var updatedPermission = await _permissionsService.UpdatePermissionAsync(id, request);
                if (updatedPermission == null)
                {
                    return this.ToErrorResponse("Permission not found", 404);
                }

                return updatedPermission.ToApiResponse("Permission updated successfully");
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while updating permission {PermissionId}", id);
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating permission {PermissionId}", id);
                return this.ToErrorResponse("An error occurred while updating the permission", 500);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePermission(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    return this.ToErrorResponse("Permission id is required", 400);
                }

                var deleted = await _permissionsService.DeletePermissionAsync(id);
                if (!deleted)
                {
                    return this.ToErrorResponse("Permission not found", 404);
                }

                return this.ToSuccessResponse("Permission deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting permission {PermissionId}", id);
                return this.ToErrorResponse("An error occurred while deleting the permission", 500);
            }
        }
    }
}
