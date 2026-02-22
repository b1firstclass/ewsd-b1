using System;
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
    public class RolesController : ControllerBase
    {
        private readonly ILogger<RolesController> _logger;
        private readonly IRolesService _rolesService;

        public RolesController(ILogger<RolesController> logger, IRolesService rolesService)
        {
            _logger = logger;
            _rolesService = rolesService;
        }

        [HasPermission(PermissionNames.RolesRead)]
        [HttpGet]
        public async Task<IActionResult> GetAllRoles([FromQuery] PaginationRequest? paginationRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                paginationRequest ??= new PaginationRequest();

                var roles = await _rolesService.GetAllRolesAsync(paginationRequest);

                return roles.ToApiResponse(ApiResponseMessages.Retrieved("Roles"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving roles");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("roles"), 500);
            }
        }

        [HasPermission(PermissionNames.RolesRead)]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetRoleById(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Role"), 400);
                }

                var role = await _rolesService.GetRoleByIdAsync(id);
                if (role == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Role"), 404);
                }

                return role.ToApiResponse(ApiResponseMessages.Retrieved("Role"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving role {RoleId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("role"), 500);
            }
        }

        [HasPermission(PermissionNames.RolesCreate)]
        [HttpPost]
        public async Task<IActionResult> CreateRole(RoleCreateRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var createdRole = await _rolesService.CreateRoleAsync(request);
                return createdRole.ToApiResponse(ApiResponseMessages.Created("Role"), 201);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while creating role");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating role");
                return this.ToErrorResponse(ApiResponseMessages.ErrorCreating("role"), 500);
            }
        }

        [HasPermission(PermissionNames.RolesUpdate)]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateRole(Guid id, RoleUpdateRequest request)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Role"), 400);
                }

                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var updatedRole = await _rolesService.UpdateRoleAsync(id, request);
                if (updatedRole == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Role"), 404);
                }

                return updatedRole.ToApiResponse(ApiResponseMessages.Updated("Role"));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while updating role {RoleId}", id);
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating role {RoleId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorUpdating("role"), 500);
            }
        }

        [HasPermission(PermissionNames.RolesDelete)]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteRole(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("Role"), 400);
                }

                var deleted = await _rolesService.DeleteRoleAsync(id);
                if (!deleted)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("Role"), 404);
                }

                return this.ToSuccessResponse(ApiResponseMessages.Deleted("Role"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting role {RoleId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorDeleting("role"), 500);
            }
        }
    }
}
