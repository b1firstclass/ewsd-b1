using CMS.Application.Common;
using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
using CMS.Infrastructure.Extensions;
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
                .FirstOrDefaultAsync(u => u.LoginId == loginId && u.IsActive);
        }

        public async Task<User?> GetByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
            {
                return null;
            }

            return await _context.Users
                .Include(u => u.Faculties)
                .Include(u => u.Roles)
                .ThenInclude(r => r.Permissions)
                .FirstOrDefaultAsync(u => u.UserId == userId && u.IsActive);
        }

        public async Task<PagedResult<User>> GetPagedAsync(int skip, int take, string? searchKeyword = null, bool? isActive = null)
        {
            if (skip < 0)
            {
                skip = 0;
            }

            var query = _context.Users
                .AsNoTracking()
                .ApplySearch(searchKeyword);

            if (isActive.HasValue)
            {
                query = query.Where(u => u.IsActive == isActive.Value);
            }
            else
            {
                query = query.Where(u => u.IsActive);
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
                .FirstOrDefaultAsync(u => u.Email == email && u.IsActive);
        }

        public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                return null;
            }

            return await _context.Users
                .Include(u => u.Faculties)
                .Include(u => u.Roles)
                .ThenInclude(r => r.Permissions)
                .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken && u.IsActive);
        }
    }
}
