using CMS.Application.Common;
using CMS.Domain.Entities;

namespace CMS.Application.Interfaces.Repositories
{
    public interface ICategoryRepository : IRepository<Category>
    {
        Task<PagedResult<Category>> GetPagedAsync(int skip, int take, string? searchKeyword = null, bool? isActive = null);
        Task<List<Category>> GetAllActiveCategoriesAsync();
    }
}
