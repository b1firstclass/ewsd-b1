using CMS.Domain.Entities;

namespace CMS.Application.Interfaces.Repositories
{
    public interface IContributionsRepository
    {
        Task<Contribution?> GetByIdAsync(Guid contributionId);
        Task<Contribution?> GetByIdWithDocumentsAsync(Guid contributionId);
        Task<IReadOnlyList<Contribution>> GetAllWithDocumentsAsync();
        Task AddAsync(Contribution contribution);
        void Update(Contribution contribution);
    }
}
