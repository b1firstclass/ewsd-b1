using CMS.Application.Common;
using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
using CMS.Infrastructure.Extensions;
using CMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace CMS.Infrastructure.Repositories
{
    public class FacultiesRepository : Repository<Faculty>, IFacultiesRepository
    {
        private readonly AppDbContext _context;
        public FacultiesRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<PagedResult<Faculty>> GetPagedAsync(int skip, int take, string? searchKeyword = null)
        {
            if (skip < 0)
            {
                skip = 0;
            }

            var query = _context.Faculties
                .AsNoTracking()
                .Where(f => f.IsActive)
                .ApplySearch(searchKeyword);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(f => f.CreatedDate)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return new PagedResult<Faculty>(items, totalCount);
        }
    }
}
