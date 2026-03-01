using CMS.Application.Common;
using CMS.Application.DTOs;

namespace CMS.Application.Interfaces.Services
{
    public interface IPermissionsService
    {
        Task<PagedResponse<PermissionInfo>> GetAllPermissionsAsync(PaginationRequest paginationRequest);
        Task<List<PermissionInfo>> GetAllActivePermissionsAsync();
        Task<PermissionInfo?> GetPermissionByIdAsync(Guid permissionId);
        Task<PermissionInfo> CreatePermissionAsync(PermissionCreateRequest request);
        Task<PermissionInfo?> UpdatePermissionAsync(Guid permissionId, PermissionUpdateRequest request);
        Task<bool> DeletePermissionAsync(Guid permissionId);
    }
}
