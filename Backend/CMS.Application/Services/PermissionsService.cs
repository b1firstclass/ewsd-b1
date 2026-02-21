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
    public class PermissionsService : IPermissionsService
    {
        private readonly ILogger<PermissionsService> _logger;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public PermissionsService(ILogger<PermissionsService> logger, IMapper mapper, IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
        {
            _logger = logger;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<PagedResponse<PermissionInfo>> GetAllPermissionsAsync(PaginationRequest paginationRequest)
        {
            var skip = paginationRequest.GetSkipCount();
            var take = paginationRequest.PageSize;

            var pagedPermissions = await _unitOfWork.PermissionsRepository.GetPagedAsync(
                skip,
                take,
                paginationRequest.SearchKeyword,
                paginationRequest.IsActive);

            var mappedPermissions = _mapper.Map<List<PermissionInfo>>(pagedPermissions.Items);
            return new PagedResponse<PermissionInfo>(mappedPermissions, pagedPermissions.TotalCount);
        }

        public async Task<PermissionInfo?> GetPermissionByIdAsync(Guid permissionId)
        {
            if (permissionId == Guid.Empty)
            {
                return null;
            }

            var permission = await _unitOfWork.Repository<Permission>().GetByIdAsync(permissionId);
            return permission == null ? null : _mapper.Map<PermissionInfo>(permission);
        }

        public async Task<PermissionInfo> CreatePermissionAsync(PermissionCreateRequest request)
        {
            PermissionValidator.EnsurePermissionAvailable(
                request.Module,
                request.Name,
                await PermissionExistsAsync(request.Module));

            var permissionEntity = _mapper.Map<Permission>(request);
            permissionEntity.CreatedDate = DateTime.UtcNow;
            permissionEntity.CreatedBy = _currentUserService.UserId;

            await _unitOfWork.Repository<Permission>().AddAsync(permissionEntity);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Permission created: {PermissionId} - {Module}:{Name}", permissionEntity.PermissionId, permissionEntity.Module, permissionEntity.Name);

            return _mapper.Map<PermissionInfo>(permissionEntity);
        }

        public async Task<PermissionInfo?> UpdatePermissionAsync(Guid permissionId, PermissionUpdateRequest request)
        {
            if (permissionId == Guid.Empty)
            {
                return null;
            }

            var permission = await _unitOfWork.Repository<Permission>().GetByIdAsync(permissionId);
            if (permission == null)
            {
                _logger.LogWarning("Permission not found for update: {PermissionId}", permissionId);
                return null;
            }

            var moduleToUse = request.Module ?? permission.Module;
            var nameToUse = request.Name ?? permission.Name;

            if (!string.Equals(permission.Module, moduleToUse, StringComparison.OrdinalIgnoreCase) ||
                !string.Equals(permission.Name, nameToUse, StringComparison.OrdinalIgnoreCase))
            {
                PermissionValidator.EnsurePermissionNameAvailable(
                    nameToUse,
                    await PermissionExistsAsync(nameToUse, permissionId));
            }

            if (!string.IsNullOrWhiteSpace(request.Module))
            {
                permission.Module = request.Module;
            }

            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                permission.Name = request.Name;
            }

            if (!string.IsNullOrWhiteSpace(request.Description))
            {
                permission.Description = request.Description;
            }

            if (request.IsActive.HasValue)
            {
                permission.IsActive = request.IsActive.Value;
            }

            permission.ModifiedDate = DateTime.UtcNow;
            permission.ModifiedBy = _currentUserService.UserId;

            _unitOfWork.Repository<Permission>().Update(permission);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Permission updated: {PermissionId}", permission.PermissionId);

            return _mapper.Map<PermissionInfo>(permission);
        }

        public async Task<bool> DeletePermissionAsync(Guid permissionId)
        {
            if (permissionId == Guid.Empty)
            {
                return false;
            }

            var permission = await _unitOfWork.Repository<Permission>().GetByIdAsync(permissionId);
            if (permission == null)
            {
                _logger.LogWarning("Permission not found for deletion: {PermissionId}", permissionId);
                return false;
            }

            _unitOfWork.Repository<Permission>().Remove(permission);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Permission deleted: {PermissionId}", permission.PermissionId);
            return true;
        }

        private async Task<bool> PermissionExistsAsync(string name, Guid? excludePermissionId = null)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return false;
            }

            var permissions = await _unitOfWork.Repository<Permission>().GetAllAsync();
            return permissions.Any(p =>
                string.Equals(p.Name, name, StringComparison.OrdinalIgnoreCase) &&
                (!excludePermissionId.HasValue || p.PermissionId != excludePermissionId.Value));
        }
    }
}
