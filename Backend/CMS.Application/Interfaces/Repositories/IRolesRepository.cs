using CMS.Application.Common;
using CMS.Domain.Entities;

namespace CMS.Application.Interfaces.Repositories
{
    public interface IRolesRepository : IRepository<Role>
    {
        Task<IReadOnlyList<Role>> GetAllWithPermissionsAsync();
        Task<List<Role>> GetAllActiveRolesAsync();
        Task<Role?> GetByIdWithPermissionsAsync(Guid roleId);
        Task<PagedResult<Role>> GetPagedWithPermissionsAsync(int skip, int take, string? searchKeyword = null, bool? isActive = null);
    }
}
