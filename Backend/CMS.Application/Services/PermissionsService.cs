using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Repositories;
using CMS.Application.Interfaces.Services;
using CMS.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace CMS.Application.Services
{
    public class PermissionsService : IPermissionsService
    {
        private readonly ILogger<PermissionsService> _logger;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public PermissionsService(ILogger<PermissionsService> logger, IMapper mapper, IUnitOfWork unitOfWork)
        {
            _logger = logger;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<PagedResponse<PermissionInfo>> GetAllPermissionsAsync(PaginationRequest paginationRequest)
        {
            paginationRequest ??= new PaginationRequest();

            var skip = paginationRequest.GetSkipCount();
            var take = paginationRequest.PageSize;
            var pagedPermissions = await _unitOfWork.PermissionsRepository.GetPagedAsync(skip, take, paginationRequest.IsActive);

            var mappedPermissions = _mapper.Map<List<PermissionInfo>>(pagedPermissions.Items);
            return new PagedResponse<PermissionInfo>(mappedPermissions, pagedPermissions.TotalCount);
        }

        public async Task<PermissionInfo?> GetPermissionByIdAsync(string permissionId)
        {
            if (string.IsNullOrWhiteSpace(permissionId))
            {
                return null;
            }

            var permission = await _unitOfWork.Repository<Permission>().GetByIdAsync(permissionId);
            return permission == null ? null : _mapper.Map<PermissionInfo>(permission);
        }

        public async Task<PermissionInfo> CreatePermissionAsync(PermissionCreateRequest request)
        {
            if (await PermissionExistsAsync(request.Module, request.Name))
            {
                throw new InvalidOperationException($"Permission '{request.Module}:{request.Name}' already exists");
            }

            var permissionEntity = _mapper.Map<Permission>(request);
            permissionEntity.CreatedDate = DateTime.UtcNow;

            await _unitOfWork.Repository<Permission>().AddAsync(permissionEntity);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Permission created: {PermissionId} - {Module}:{Name}", permissionEntity.PermissionId, permissionEntity.Module, permissionEntity.Name);

            return _mapper.Map<PermissionInfo>(permissionEntity);
        }

        public async Task<PermissionInfo?> UpdatePermissionAsync(string permissionId, PermissionUpdateRequest request)
        {
            var permission = await _unitOfWork.Repository<Permission>().GetByIdAsync(permissionId);
            if (permission == null)
            {
                _logger.LogWarning("Permission not found for update: {PermissionId}", permissionId);
                return null;
            }

            var moduleToUse = request.Module ?? permission.Module;
            var nameToUse = request.Name ?? permission.Name;

            if ((!string.Equals(permission.Module, moduleToUse, StringComparison.OrdinalIgnoreCase) ||
                !string.Equals(permission.Name, nameToUse, StringComparison.OrdinalIgnoreCase)) &&
                await PermissionExistsAsync(moduleToUse, nameToUse, permissionId))
            {
                throw new InvalidOperationException($"Permission '{moduleToUse}:{nameToUse}' already exists");
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

            _unitOfWork.Repository<Permission>().Update(permission);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Permission updated: {PermissionId}", permission.PermissionId);

            return _mapper.Map<PermissionInfo>(permission);
        }

        public async Task<bool> DeletePermissionAsync(string permissionId)
        {
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

        private async Task<bool> PermissionExistsAsync(string module, string name, string? excludePermissionId = null)
        {
            if (string.IsNullOrWhiteSpace(module) || string.IsNullOrWhiteSpace(name))
            {
                return false;
            }

            var permissions = await _unitOfWork.Repository<Permission>().GetAllAsync();
            return permissions.Any(p =>
                string.Equals(p.Module, module, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(p.Name, name, StringComparison.OrdinalIgnoreCase) &&
                (excludePermissionId == null || !string.Equals(p.PermissionId, excludePermissionId, StringComparison.OrdinalIgnoreCase)));
        }
    }
}
