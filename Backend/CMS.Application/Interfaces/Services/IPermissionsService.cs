using CMS.Application.Common;
using CMS.Application.DTOs;
using System.Threading.Tasks;

namespace CMS.Application.Interfaces.Services
{
    public interface IPermissionsService
    {
        Task<PagedResponse<PermissionInfo>> GetAllPermissionsAsync(PaginationRequest paginationRequest);
        Task<PermissionInfo?> GetPermissionByIdAsync(string permissionId);
        Task<PermissionInfo> CreatePermissionAsync(PermissionCreateRequest request);
        Task<PermissionInfo?> UpdatePermissionAsync(string permissionId, PermissionUpdateRequest request);
        Task<bool> DeletePermissionAsync(string permissionId);
    }
}
