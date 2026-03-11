using CMS.Application.Common;
using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
using CMS.Infrastructure.Extensions;
using CMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

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
                .Include(u => u.Role)
                .ThenInclude(r => r.Permissions)
                .FirstOrDefaultAsync(u => u.LoginId == loginId);
        }

        public async Task<User?> GetByUserIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
            {
                return null;
            }

            return await _context.Users
                .Include(u => u.Faculties)
                .Include(u => u.Role)
                .ThenInclude(r => r.Permissions)
                .FirstOrDefaultAsync(u => u.UserId == userId);
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

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(u => u.CreatedDate)
                .Include(u => u.Role)
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

        public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                return null;
            }

            return await _context.Users
                .Include(u => u.Faculties)
                .Include(u => u.Role)
                .ThenInclude(r => r.Permissions)
                .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken && u.IsActive);
        }

        public async Task<bool> ExistsUserInRoleWithFacultiesAsync(string roleName, IReadOnlyCollection<Guid> facultyIds, Guid? excludeUserId = null)
        {
            if (string.IsNullOrWhiteSpace(roleName) || facultyIds.Count == 0)
            {
                return false;
            }

            var normalizedRoleName = roleName.Trim().ToLowerInvariant();
            var query = _context.Users
                .AsNoTracking()
                .Where(user => user.IsActive)
                .Where(user => user.Role.Name.ToLower() == normalizedRoleName)
                .Where(user => user.Faculties.Any(faculty => facultyIds.Contains(faculty.FacultyId)));

            if (excludeUserId.HasValue)
            {
                query = query.Where(user => user.UserId != excludeUserId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<List<User>> GetUsersByFacultyIdAsync(List<Guid> facultyIds, string roleName)
        {
            if (facultyIds == null || facultyIds.Count == 0 || string.IsNullOrWhiteSpace(roleName))
            {
                return new List<User>();
            }

            var normalizedRoleName = roleName.Trim().ToLowerInvariant();
            var query = _context.Users
                .AsNoTracking()
                .Where(user => user.IsActive)
                .Where(user => user.Role.Name.ToLower() == normalizedRoleName)
                .Where(user => user.Faculties.Any(faculty => facultyIds.Contains(faculty.FacultyId)));

            return await query.ToListAsync();
        }
    }
}
