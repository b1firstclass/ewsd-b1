using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Repositories;
using CMS.Application.Interfaces.Services;
using CMS.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace CMS.Application.Services
{
    public class RolesService : IRolesService
    {
        private readonly ILogger<RolesService> _logger;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public RolesService(ILogger<RolesService> logger, IMapper mapper, IUnitOfWork unitOfWork)
        {
            _logger = logger;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<List<RoleInfo>> GetAllRolesAsync()
        {
            var roles = await _unitOfWork.Repository<Role>().GetAllAsync();
            return _mapper.Map<List<RoleInfo>>(roles);
        }

        public async Task<RoleInfo?> GetRoleByIdAsync(string roleId)
        {
            if (string.IsNullOrWhiteSpace(roleId))
            {
                return null;
            }

            var role = await _unitOfWork.Repository<Role>().GetByIdAsync(roleId);
            return role == null ? null : _mapper.Map<RoleInfo>(role);
        }

        public async Task<RoleInfo> CreateRoleAsync(RoleCreateRequest request)
        {
            if (await RoleNameExistsAsync(request.Name))
            {
                throw new InvalidOperationException($"Role with name '{request.Name}' already exists");
            }

            var roleEntity = _mapper.Map<Role>(request);
            roleEntity.CreatedDate = DateTime.UtcNow;

            await _unitOfWork.Repository<Role>().AddAsync(roleEntity);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Role created: {RoleId} - {RoleName}", roleEntity.RoleId, roleEntity.Name);

            return _mapper.Map<RoleInfo>(roleEntity);
        }

        public async Task<RoleInfo?> UpdateRoleAsync(string roleId, RoleUpdateRequest request)
        {
            var role = await _unitOfWork.Repository<Role>().GetByIdAsync(roleId);
            if (role == null)
            {
                _logger.LogWarning("Role not found for update: {RoleId}", roleId);
                return null;
            }

            if (!string.IsNullOrWhiteSpace(request.Name) &&
                !string.Equals(role.Name, request.Name, StringComparison.OrdinalIgnoreCase))
            {
                if (await RoleNameExistsAsync(request.Name, roleId))
                {
                    throw new InvalidOperationException($"Role with name '{request.Name}' already exists");
                }

                role.Name = request.Name;
            }

            if (!string.IsNullOrWhiteSpace(request.Description))
            {
                role.Description = request.Description;
            }

            if (request.IsActive.HasValue)
            {
                role.IsActive = request.IsActive.Value;
            }

            role.ModifiedDate = DateTime.UtcNow;

            _unitOfWork.Repository<Role>().Update(role);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Role updated: {RoleId}", role.RoleId);

            return _mapper.Map<RoleInfo>(role);
        }

        public async Task<bool> DeleteRoleAsync(string roleId)
        {
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

        private async Task<bool> RoleNameExistsAsync(string roleName, string? excludeRoleId = null)
        {
            if (string.IsNullOrWhiteSpace(roleName))
            {
                return false;
            }

            var roles = await _unitOfWork.Repository<Role>().GetAllAsync();
            return roles.Any(r =>
                string.Equals(r.Name, roleName, StringComparison.OrdinalIgnoreCase) &&
                (excludeRoleId == null || !string.Equals(r.RoleId, excludeRoleId, StringComparison.OrdinalIgnoreCase)));
        }
    }
}
