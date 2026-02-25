using CMS.Application.Common;
using CMS.Application.DTOs;

namespace CMS.Application.Interfaces.Services
{
    public interface IRolesService
    {
        Task<PagedResponse<RoleInfo>> GetAllRolesAsync(PaginationRequest paginationRequest);
        Task<RoleInfo?> GetRoleByIdAsync(Guid roleId);
        Task<RoleInfo> CreateRoleAsync(RoleCreateRequest request);
        Task<RoleInfo?> UpdateRoleAsync(Guid roleId, RoleUpdateRequest request);
        Task<bool> DeleteRoleAsync(Guid roleId);
    }
}
