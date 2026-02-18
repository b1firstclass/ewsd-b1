using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CMS.Application.Common;
using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
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

        public async Task<Role?> GetByIdWithPermissionsAsync(string roleId)
        {
            if (string.IsNullOrWhiteSpace(roleId))
            {
                return null;
            }

            return await _context.Roles
                .Include(r => r.Permissions)
                .FirstOrDefaultAsync(r => r.RoleId == roleId && r.IsActive);
        }

        public async Task<PagedResult<Role>> GetPagedWithPermissionsAsync(int skip, int take)
        {
            if (skip < 0)
            {
                skip = 0;
            }

            var query = _context.Roles
                .AsNoTracking();

            var totalCount = await query.CountAsync();

            var items = await query
                .Where(r => r.IsActive)
                .OrderBy(r => r.Name)
                .ThenBy(r => r.RoleId)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return new PagedResult<Role>(items, totalCount);
        }
    }
}
