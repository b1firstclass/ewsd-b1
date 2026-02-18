using CMS.Application.Common;
using CMS.Domain.Entities;
using System.Threading.Tasks;

namespace CMS.Application.Interfaces.Repositories
{
    public interface IFacultiesRepository : IRepository<Faculty>
    {
        Task<PagedResult<Faculty>> GetPagedAsync(int skip, int take);
    }
}
