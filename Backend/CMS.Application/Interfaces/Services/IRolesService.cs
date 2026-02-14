using CMS.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CMS.Application.Interfaces.Services
{
    public interface IRolesService
    {
        Task<List<RoleInfo>> GetAllRolesAsync();
        Task<RoleInfo?> GetRoleByIdAsync(string roleId);
        Task<RoleInfo> CreateRoleAsync(RoleCreateRequest request);
        Task<RoleInfo?> UpdateRoleAsync(string roleId, RoleUpdateRequest request);
        Task<bool> DeleteRoleAsync(string roleId);
    }
}
