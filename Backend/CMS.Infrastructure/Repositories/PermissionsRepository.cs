using CMS.Application.Common;
using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
using CMS.Infrastructure.Extensions;
using CMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CMS.Infrastructure.Repositories
{
    public class PermissionsRepository : Repository<Permission>, IPermissionsRepository
    {
        private readonly AppDbContext _context;

        public PermissionsRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<PagedResult<Permission>> GetPagedAsync(int skip, int take, string? searchKeyword = null, bool? isActive = null)
        {
            if (skip < 0)
            {
                skip = 0;
            }

            var query = _context.Permissions
                .AsNoTracking()
                .ApplySearch(searchKeyword);

            if (isActive.HasValue)
            {
                query = query.Where(p => p.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(p => p.CreatedDate)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return new PagedResult<Permission>(items, totalCount);
        }

        public async Task<List<Permission>> GetAllActivePermissionsAsync()
        {
            return await _context.Permissions
                .AsNoTracking()
                .Where(p => p.IsActive)
                .OrderBy(p => p.Name)
                .ToListAsync();
        }
    }
}
