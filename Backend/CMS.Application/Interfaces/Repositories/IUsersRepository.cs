using CMS.Application.Common;
using CMS.Domain.Entities;
using System.Threading.Tasks;

namespace CMS.Application.Interfaces.Repositories
{
    public interface IUsersRepository : IRepository<User>
    {
        Task<User?> GetByLoginIdAsync(string loginId);
        Task<User?> GetByUserIdAsync(string userId);
        Task<PagedResult<User>> GetPagedAsync(int skip, int take, string? searchKeyword = null);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByRefreshTokenAsync(string refreshToken);
    }
}
