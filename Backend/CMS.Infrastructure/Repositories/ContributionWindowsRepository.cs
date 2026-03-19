using CMS.Application.Common;
using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
using CMS.Infrastructure.Extensions;
using CMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CMS.Infrastructure.Repositories
{
    public class ContributionWindowsRepository : IContributionWindowsRepository
    {
        private readonly AppDbContext _context;

        public ContributionWindowsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<ContributionWindow>> GetPagedAsync(int skip, int take, string? searchKeyword = null, bool? isActive = null)
        {
            if (skip < 0)
            {
                skip = 0;
            }


            var query = _context.ContributionWindows
                .AsNoTracking()
                .ApplySearch(searchKeyword);

            if (isActive.HasValue)
            {
                query = query.Where(cw => cw.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(w => w.CreatedDate)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return new PagedResult<ContributionWindow>(items, totalCount);
        }

        public async Task<ContributionWindow?> GetByIdAsync(Guid contributionWindowId)
        {
            if (contributionWindowId == Guid.Empty)
            {
                return null;
            }

            return await _context.ContributionWindows
                .FirstOrDefaultAsync(cw => cw.ContributionWindowId == contributionWindowId);
        }

        public async Task<IReadOnlyList<ContributionWindow>> GetAllActiveAsync()
        {
            return await _context.ContributionWindows
                .AsNoTracking()
                .Where(cw => cw.IsActive)
                .OrderByDescending(cw => cw.CreatedDate)
                .ToListAsync();
        }

        public async Task<ContributionWindow?> GetCurrentWindowAsync(DateTime utcNow)
        {
            return await _context.ContributionWindows
                .AsNoTracking()
                .Where(cw => cw.IsActive && cw.SubmissionOpenDate <= utcNow && cw.ClosureDate >= utcNow)
                .OrderByDescending(cw => cw.SubmissionOpenDate)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> ExistsForAcademicYearAsync(int academicYearStart, int academicYearEnd, Guid? excludeContributionWindowId = null)
        {
            var query = _context.ContributionWindows.AsNoTracking()
                .Where(cw => cw.AcademicYearStart <= academicYearEnd && cw.AcademicYearEnd >= academicYearStart);

            if (excludeContributionWindowId.HasValue)
            {
                query = query.Where(cw => cw.ContributionWindowId != excludeContributionWindowId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task AddAsync(ContributionWindow contributionWindow)
        {
            await _context.ContributionWindows.AddAsync(contributionWindow);
        }

        public void Update(ContributionWindow contributionWindow)
        {
            _context.ContributionWindows.Update(contributionWindow);
        }
    }
}
