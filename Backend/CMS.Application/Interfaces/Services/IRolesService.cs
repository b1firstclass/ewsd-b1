using CMS.Application.Common;
using CMS.Application.DTOs;
using System.Threading.Tasks;

namespace CMS.Application.Interfaces.Services
{
    public interface IRolesService
    {
        Task<PagedResponse<RoleInfo>> GetAllRolesAsync(PaginationRequest paginationRequest);
        Task<RoleInfo?> GetRoleByIdAsync(string roleId);
        Task<RoleInfo> CreateRoleAsync(RoleCreateRequest request);
        Task<RoleInfo?> UpdateRoleAsync(string roleId, RoleUpdateRequest request);
        Task<bool> DeleteRoleAsync(string roleId);
    }
}
