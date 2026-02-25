using CMS.Application.Common;
using CMS.Domain.Entities;

namespace CMS.Application.Interfaces.Repositories
{
    public interface IFacultiesRepository : IRepository<Faculty>
    {
        Task<PagedResult<Faculty>> GetPagedAsync(int skip, int take, string? searchKeyword = null, bool? isActive = null);
    }
}
