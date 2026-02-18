using CMS.Application.Common;
using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
using CMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace CMS.Infrastructure.Repositories
{
    public class PermissionsRepository : Repository<Permission>, IPermissionsRepository
    {
        private readonly AppDbContext _context;

        public PermissionsRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<PagedResult<Permission>> GetPagedAsync(int skip, int take)
        {
            if (skip < 0)
            {
                skip = 0;
            }

            var query = _context.Permissions.AsNoTracking();

            var totalCount = await query.CountAsync();

            var items = await query
                .Where(p => p.IsActive)
                .OrderBy(p => p.Module)
                .ThenBy(p => p.Name)
                .ThenBy(p => p.PermissionId)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return new PagedResult<Permission>(items, totalCount);
        }
    }
}
