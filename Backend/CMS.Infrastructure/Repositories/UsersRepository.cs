using CMS.Application.Common;
using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
using CMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
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
                .ThenInclude(r => r.Permissions)
                .FirstOrDefaultAsync(u => u.LoginId == loginId);
        }

        public async Task<User?> GetByUserIdAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                return null;
            }

            return await _context.Users
                .Include(u => u.Faculties)
                .Include(u => u.Roles)
                .ThenInclude(r => r.Permissions)
                .FirstOrDefaultAsync(u => u.UserId == userId);
        }

        public async Task<PagedResult<User>> GetPagedAsync(int skip, int take, bool? isActive = null)
        {
            if (skip < 0)
            {
                skip = 0;
            }

            var query = _context.Users.AsNoTracking();

            if (isActive.HasValue)
            {
                query = query.Where(u => u.IsActive == isActive.Value);
            }
            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(u => u.CreatedDate)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return new PagedResult<User>(items, totalCount);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return null;
            }

            return await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email);
        }
    }
}
