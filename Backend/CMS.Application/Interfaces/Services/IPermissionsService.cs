using CMS.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CMS.Application.Interfaces.Services
{
    public interface IPermissionsService
    {
        Task<List<PermissionInfo>> GetAllPermissionsAsync();
        Task<PermissionInfo?> GetPermissionByIdAsync(string permissionId);
        Task<PermissionInfo> CreatePermissionAsync(PermissionCreateRequest request);
        Task<PermissionInfo?> UpdatePermissionAsync(string permissionId, PermissionUpdateRequest request);
        Task<bool> DeletePermissionAsync(string permissionId);
    }
}
