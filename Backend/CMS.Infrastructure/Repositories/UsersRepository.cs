using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
using CMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace CMS.Infrastructure.Repositories
{
    public class UsersRepository : Repository<User>, IUsersRepository
    {
        private readonly AppDbContext _context;
        public UsersRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<User?> GetByLoginIdAsync(string loginId)
        {
            if (string.IsNullOrWhiteSpace(loginId))
            {
                return null;
            }

            return await _context.Users
                .Include(u => u.Faculties)
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.LoginId == loginId);
        }

        public async Task<User?> GetByIdWithFacultiesAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                return null;
            }

            return await _context.Users
                .Include(u => u.Faculties)
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.UserId == userId);
        }
    }
}
