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
    public class PermissionsController : ControllerBase
    {
        private readonly ILogger<PermissionsController> _logger;
        private readonly IPermissionsService _permissionsService;

        public PermissionsController(ILogger<PermissionsController> logger, IPermissionsService permissionsService)
        {
            _logger = logger;
            _permissionsService = permissionsService;
        }

        [HasPermission(PermissionNames.PermissionsRead)]
        [HttpGet]
        public async Task<IActionResult> GetAllPermissions([FromQuery] PaginationRequest? paginationRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                paginationRequest ??= new PaginationRequest();

                var permissions = await _permissionsService.GetAllPermissionsAsync(paginationRequest);
                return permissions.ToApiResponse(ApiResponseMessages.Retrieved("Permissions"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving permissions");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("permissions"), 500);
            }
        }

        [HasPermission(PermissionNames.PermissionsRead)]
        [HttpGet("ActivePermissions")]
        public async Task<IActionResult> GetAllActivePermissions()
        {
            try
            {
                var permissions = await _permissionsService.GetAllActivePermissionsAsync();
                return permissions.ToApiResponse(ApiResponseMessages.Retrieved("Permissions"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving permissions");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("permissions"), 500);
            }
        }


        [HasPermission(PermissionNames.PermissionsRead)]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetPermissionById(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Permission"), 400);
                }

                var permission = await _permissionsService.GetPermissionByIdAsync(id);
                if (permission == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Permission"), 404);
                }

                return permission.ToApiResponse(ApiResponseMessages.Retrieved("Permission"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving permission {PermissionId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("permission"), 500);
            }
        }

        [HasPermission(PermissionNames.PermissionsCreate)]
        [HttpPost]
        public async Task<IActionResult> CreatePermission(PermissionCreateRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var createdPermission = await _permissionsService.CreatePermissionAsync(request);
                return createdPermission.ToApiResponse(ApiResponseMessages.Created("Permission"), 201);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Permission validation failed while creating permission");
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while creating permission");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating permission");
                return this.ToErrorResponse(ApiResponseMessages.ErrorCreating("permission"), 500);
            }
        }

        [HasPermission(PermissionNames.PermissionsUpdate)]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdatePermission(Guid id, PermissionUpdateRequest request)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Permission"), 400);
                }

                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var updatedPermission = await _permissionsService.UpdatePermissionAsync(id, request);
                if (updatedPermission == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Permission"), 404);
                }

                return updatedPermission.ToApiResponse(ApiResponseMessages.Updated("Permission"));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Permission validation failed while updating permission {PermissionId}", id);
                return this.ToErrorResponse(ex.Message, 400);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while updating permission {PermissionId}", id);
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating permission {PermissionId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorUpdating("permission"), 500);
            }
        }

        [HasPermission(PermissionNames.PermissionsDelete)]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeletePermission(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Permission"), 400);
                }

                var deleted = await _permissionsService.DeletePermissionAsync(id);
                if (!deleted)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Permission"), 404);
                }

                return this.ToSuccessResponse(ApiResponseMessages.Deleted("Permission"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting permission {PermissionId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorDeleting("permission"), 500);
            }
        }
    }
}
