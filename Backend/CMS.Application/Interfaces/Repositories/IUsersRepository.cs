using CMS.Application.Common;
using CMS.Domain.Entities;
using System.Threading.Tasks;

namespace CMS.Application.Interfaces.Repositories
{
    public interface IUsersRepository : IRepository<User>
    {
        Task<User?> GetByLoginIdAsync(string loginId);
        Task<User?> GetByIdWithFacultiesAsync(string userId);
        Task<PagedResult<User>> GetPagedAsync(int skip, int take, bool? isActive = null);
        Task<User?> GetByEmailAsync(string email);
    }
}
