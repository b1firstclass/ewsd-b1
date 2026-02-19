using CMS.Application.Common;
using CMS.Domain.Entities;
using System.Threading.Tasks;

namespace CMS.Application.Interfaces.Repositories
{
    public interface IPermissionsRepository : IRepository<Permission>
    {
        Task<PagedResult<Permission>> GetPagedAsync(int skip, int take, string? searchKeyword = null);
    }
}
