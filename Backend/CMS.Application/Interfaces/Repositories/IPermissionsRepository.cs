using CMS.Application.Common;
using CMS.Domain.Entities;

namespace CMS.Application.Interfaces.Repositories
{
    public interface IPermissionsRepository : IRepository<Permission>
    {
        Task<PagedResult<Permission>> GetPagedAsync(int skip, int take, string? searchKeyword = null, bool? isActive = null);
        Task<List<Permission>> GetAllActivePermissionsAsync();
    }
}
