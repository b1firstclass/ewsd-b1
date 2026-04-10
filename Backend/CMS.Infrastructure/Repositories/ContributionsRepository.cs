using CMS.Application.Common;
using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
using CMS.Infrastructure.Extensions;
using CMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CMS.Infrastructure.Repositories
{
    public class ContributionsRepository : IContributionsRepository
    {
        private readonly AppDbContext _context;

        public ContributionsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Contribution?> GetByIdAsync(Guid contributionId)
        {
            if (contributionId == Guid.Empty)
            {
                return null;
            }

            return await _context.Contributions
                .FirstOrDefaultAsync(contribution => contribution.ContributionId == contributionId);
        }

        public async Task<IReadOnlyList<Contribution>> GetByStatusAsync(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                return Array.Empty<Contribution>();
            }

            return await _context.Contributions
                .Where(contribution => contribution.Status == status)
                .OrderByDescending(contribution => contribution.CreatedDate)
                .ToListAsync();
        }

        public async Task<PagedResult<Contribution>> GetPagedByUserAsync(Guid userId, int skip, int take, Guid? contributionWindowId = null, string? status = null, string? searchKeyword = null, bool? isActive = null)
        {
            if (userId == Guid.Empty)
            {
                return new PagedResult<Contribution>(Array.Empty<Contribution>(), 0);
            }

            if (skip < 0)
            {
                skip = 0;
            }

            var query = _context.Contributions
                .AsNoTracking()
                .Where(contribution => contribution.UserId == userId)
                .ApplySearch(searchKeyword);

            if (contributionWindowId.HasValue && contributionWindowId.Value != Guid.Empty)
            {
                query = query.Where(contribution => contribution.ContributionWindowId == contributionWindowId.Value);
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(contribution => contribution.Status == status);
            }

            if (isActive.HasValue)
            {
                query = query.Where(contribution => contribution.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(contribution => contribution.CreatedDate)
                .Include(c => c.Faculty)
                .Include(c => c.User)
                .Include(c => c.Documents.Where(d => d.IsActive &&
                                d.Extension != null &&
                                ContributionConstants.AllowedImageExtensions.Contains(d.Extension)))
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return new PagedResult<Contribution>(items, totalCount);
        }

        public async Task<PagedResult<Contribution>> GetPagedByFacultiesAsync(Guid coordinatorUserId, IReadOnlyCollection<Guid> facultyIds, int skip, int take, Guid? contributionWindowId = null, string? status = null, string? searchKeyword = null, bool? isActive = null)
        {
            if (coordinatorUserId == Guid.Empty || facultyIds.Count == 0)
            {
                return new PagedResult<Contribution>(Array.Empty<Contribution>(), 0);
            }

            if (skip < 0)
            {
                skip = 0;
            }

            var query = _context.Contributions
                .AsNoTracking()
                .Where(contribution => facultyIds.Contains(contribution.FacultyId))
                .Where(contribution => contribution.Status != ContributionConstants.StatusDraft)
                .Where(contribution => !contribution.ReviewedBy.HasValue || contribution.ReviewedBy.Value == coordinatorUserId)
                .ApplySearch(searchKeyword);

            if (contributionWindowId.HasValue && contributionWindowId.Value != Guid.Empty)
            {
                query = query.Where(contribution => contribution.ContributionWindowId == contributionWindowId.Value);
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(contribution => contribution.Status == status);
            }

            if (isActive.HasValue)
            {
                query = query.Where(contribution => contribution.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(contribution => contribution.CreatedDate)
                .Include(c => c.Faculty)
                .Include(c => c.User)
                .Include(c => c.Documents.Where(d => d.IsActive &&
                                d.Extension != null &&
                                ContributionConstants.AllowedImageExtensions.Contains(d.Extension)))
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return new PagedResult<Contribution>(items, totalCount);
        }

        public async Task<PagedResult<Contribution>> GetPagedSelectedByFacultiesAsync(IReadOnlyCollection<Guid> facultyIds, int skip, int take, Guid? contributionWindowId = null, string? searchKeyword = null, bool? isActive = null)
        {
            if (facultyIds.Count == 0)
            {
                return new PagedResult<Contribution>(Array.Empty<Contribution>(), 0);
            }

            if (skip < 0)
            {
                skip = 0;
            }

            var query = _context.Contributions
                .AsNoTracking()
                .Where(contribution => facultyIds.Contains(contribution.FacultyId))
                .Where(contribution => contribution.Status == ContributionConstants.StatusSelected)
                .ApplySearch(searchKeyword);

            if (contributionWindowId.HasValue && contributionWindowId.Value != Guid.Empty)
            {
                query = query.Where(contribution => contribution.ContributionWindowId == contributionWindowId.Value);
            }

            if (isActive.HasValue)
            {
                query = query.Where(contribution => contribution.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(contribution => contribution.CreatedDate)
                .Include(c => c.Faculty)
                .Include(c => c.User)
                .Include(c => c.Documents.Where(d => d.IsActive &&
                                d.Extension != null &&
                                ContributionConstants.AllowedImageExtensions.Contains(d.Extension)))
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return new PagedResult<Contribution>(items, totalCount);
        }

        public async Task<Contribution?> GetByIdWithDocumentsAsync(Guid contributionId)
        {
            if (contributionId == Guid.Empty)
            {
                return null;
            }

            return await _context.Contributions
                .Include(contribution => contribution.Documents)
                .FirstOrDefaultAsync(contribution => contribution.ContributionId == contributionId);
        }

        public async Task<Contribution?> GetByIdWithDetailsAsync(Guid contributionId)
        {
            if (contributionId == Guid.Empty)
            {
                return null;
            }

            return await _context.Contributions
                .Include(contribution => contribution.Documents)
                .Include(contribution => contribution.Comments)
                .Include(contribution => contribution.Category)
                .FirstOrDefaultAsync(contribution => contribution.ContributionId == contributionId);
        }

        public async Task<IReadOnlyList<Contribution>> GetAllWithDocumentsAsync()
        {
            return await _context.Contributions
                .Include(contribution => contribution.Documents)
                .ToListAsync();
        }

        public async Task AddAsync(Contribution contribution)
        {
            await _context.Contributions.AddAsync(contribution);
        }

        public void Update(Contribution contribution)
        {
            _context.Contributions.Update(contribution);
        }

        public void Remove(Contribution contribution)
        {
            _context.Contributions.Remove(contribution);
        }
    }
}
