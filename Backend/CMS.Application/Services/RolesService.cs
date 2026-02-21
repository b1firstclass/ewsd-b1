using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Repositories;
using CMS.Application.Interfaces.Services;
using CMS.Application.Utilities;
using CMS.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace CMS.Application.Services
{
    public class RolesService : IRolesService
    {
        private readonly ILogger<RolesService> _logger;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public RolesService(ILogger<RolesService> logger, IMapper mapper, IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
        {
            _logger = logger;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<PagedResponse<RoleInfo>> GetAllRolesAsync(PaginationRequest paginationRequest)
        {
            var skip = paginationRequest.GetSkipCount();
            var take = paginationRequest.PageSize;

            var pagedRoles = await _unitOfWork.RolesRepository.GetPagedWithPermissionsAsync(
                skip,
                take,
                paginationRequest.SearchKeyword,
                paginationRequest.IsActive);

            var mappedRoles = _mapper.Map<List<RoleInfo>>(pagedRoles.Items);
            return new PagedResponse<RoleInfo>(mappedRoles, pagedRoles.TotalCount);
        }

        public async Task<RoleInfo?> GetRoleByIdAsync(Guid roleId)
        {
            if (roleId == Guid.Empty)
            {
                return null;
            }

            var role = await _unitOfWork.RolesRepository.GetByIdWithPermissionsAsync(roleId);

            return role == null ? null : _mapper.Map<RoleInfo>(role);
        }

        public async Task<RoleInfo> CreateRoleAsync(RoleCreateRequest request)
        {
            RoleValidator.EnsureRoleNameAvailable(request.Name, await RoleNameExistsAsync(request.Name));

            var roleEntity = _mapper.Map<Role>(request);
            roleEntity.CreatedDate = DateTime.UtcNow;
            roleEntity.CreatedBy = _currentUserService.UserId;
            await AssignPermissionsAsync(roleEntity, request.PermissionIds);

            await _unitOfWork.Repository<Role>().AddAsync(roleEntity);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Role created: {RoleId} - {RoleName}", roleEntity.RoleId, roleEntity.Name);

            return _mapper.Map<RoleInfo>(roleEntity);
        }

        public async Task<RoleInfo?> UpdateRoleAsync(Guid roleId, RoleUpdateRequest request)
        {
            if (roleId == Guid.Empty)
            {
                return null;
            }

            var role = await _unitOfWork.RolesRepository.GetByIdWithPermissionsAsync(roleId);
            if (role == null)
            {
                _logger.LogWarning("Role not found for update: {RoleId}", roleId);
                return null;
            }

            if (!string.IsNullOrWhiteSpace(request.Name) &&
                !string.Equals(role.Name, request.Name, StringComparison.OrdinalIgnoreCase))
            {
                RoleValidator.EnsureRoleNameAvailable(request.Name, await RoleNameExistsAsync(request.Name, roleId));

                role.Name = request.Name;
            }

            if (!string.IsNullOrWhiteSpace(request.Description))
            {
                role.Description = request.Description;
            }

            if (request.PermissionIds != null)
            {
                await AssignPermissionsAsync(role, request.PermissionIds);
            }

            if (request.IsActive.HasValue)
            {
                role.IsActive = request.IsActive.Value;
            }

            role.ModifiedDate = DateTime.UtcNow;
            role.ModifiedBy = _currentUserService.UserId;

            _unitOfWork.Repository<Role>().Update(role);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Role updated: {RoleId}", role.RoleId);

            return _mapper.Map<RoleInfo>(role);
        }

        public async Task<bool> DeleteRoleAsync(Guid roleId)
        {
            if (roleId == Guid.Empty)
            {
                return false;
            }

            var role = await _unitOfWork.Repository<Role>().GetByIdAsync(roleId);
            if (role == null)
            {
                _logger.LogWarning("Role not found for deletion: {RoleId}", roleId);
                return false;
            }

            _unitOfWork.Repository<Role>().Remove(role);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Role deleted: {RoleId}", role.RoleId);
            return true;
        }

        private async Task<bool> RoleNameExistsAsync(string roleName, Guid? excludeRoleId = null)
        {
            if (string.IsNullOrWhiteSpace(roleName))
            {
                return false;
            }

            var roles = await _unitOfWork.Repository<Role>().GetAllAsync();
            return roles.Any(r =>
                string.Equals(r.Name, roleName, StringComparison.OrdinalIgnoreCase) &&
                (!excludeRoleId.HasValue || r.RoleId != excludeRoleId.Value));
        }

        private async Task AssignPermissionsAsync(Role role, IEnumerable<Guid>? permissionIds)
        {
            if (role.Permissions == null)
            {
                role.Permissions = new List<Permission>();
            }

            role.Permissions.Clear();

            if (permissionIds == null)
            {
                return;
            }

            foreach (var permissionId in permissionIds.Where(id => id != Guid.Empty).Distinct())
            {
                var permission = await _unitOfWork.Repository<Permission>().GetByIdAsync(permissionId);
                if (permission != null && permission.IsActive)
                {
                    role.Permissions.Add(permission);
                }
                else
                {
                    _logger.LogWarning("Permission not found while assigning to role {RoleId}: {PermissionId}", role.RoleId, permissionId);
                }
            }
        }
    }
}
