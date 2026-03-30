using CMS.Application.Common;
using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
using CMS.Infrastructure.Extensions;
using CMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CMS.Infrastructure.Repositories
{
    public class CategoryRepository : Repository<Category>, ICategoryRepository
    {
        private readonly AppDbContext _context;

        public CategoryRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<PagedResult<Category>> GetPagedAsync(int skip, int take, string? searchKeyword = null, bool? isActive = null)
        {
            if (skip < 0)
            {
                skip = 0;
            }

            var query = _context.Categories
                .AsNoTracking()
                .ApplySearch(searchKeyword);

            if (isActive.HasValue)
            {
                query = query.Where(c => c.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(c => c.CreatedDate)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return new PagedResult<Category>(items, totalCount);
        }

        public async Task<List<Category>> GetAllActiveCategoriesAsync()
        {
            return await _context.Categories
                .AsNoTracking()
                .Where(c => c.IsActive)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }
    }
}
