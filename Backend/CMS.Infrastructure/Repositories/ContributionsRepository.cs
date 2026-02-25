using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
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
    }
}
