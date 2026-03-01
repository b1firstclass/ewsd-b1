using CMS.Application.Common;
using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
using CMS.Infrastructure.Extensions;
using CMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CMS.Infrastructure.Repositories
{
    public class RolesRepository : Repository<Role>, IRolesRepository
    {
        private readonly AppDbContext _context;

        public RolesRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<Role>> GetAllWithPermissionsAsync()
        {
            return await _context.Roles
                .Include(r => r.Permissions)
                .ToListAsync();
        }

        public async Task<Role?> GetByIdWithPermissionsAsync(Guid roleId)
        {
            if (roleId == Guid.Empty)
            {
                return null;
            }

            return await _context.Roles
                .Include(r => r.Permissions)
                .FirstOrDefaultAsync(r => r.RoleId == roleId);
        }

        public async Task<List<Role>> GetAllActiveRolesAsync()
        {
            return await _context.Roles
               .AsNoTracking()
               .Where(r => r.IsActive)
               .OrderBy(r => r.Name)
               .ToListAsync();
        }

        public async Task<PagedResult<Role>> GetPagedWithPermissionsAsync(int skip, int take, string? searchKeyword = null, bool? isActive = null)
        {
            if (skip < 0)
            {
                skip = 0;
            }

            var query = _context.Roles
                .AsNoTracking()
                .ApplySearch(searchKeyword);

            if (isActive.HasValue)
            {
                query = query.Where(r => r.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(r => r.CreatedDate)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return new PagedResult<Role>(items, totalCount);
        }
    }
}
