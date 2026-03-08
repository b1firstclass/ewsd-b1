using CMS.Domain.Entities;
using CMS.Application.Common;

namespace CMS.Application.Interfaces.Repositories
{
    public interface IContributionsRepository
    {
        Task<Contribution?> GetByIdAsync(Guid contributionId);
        Task<PagedResult<Contribution>> GetPagedByUserAsync(Guid userId, int skip, int take, string? status = null, string? searchKeyword = null, bool? isActive = null);
        Task<PagedResult<Contribution>> GetPagedByFacultiesAsync(Guid coordinatorUserId, IReadOnlyCollection<Guid> facultyIds, int skip, int take, string? status = null, string? searchKeyword = null, bool? isActive = null);
        Task<IReadOnlyList<Contribution>> GetByStatusAsync(string status);
        Task<Contribution?> GetByIdWithDetailsAsync(Guid contributionId);
        Task<Contribution?> GetByIdWithDocumentsAsync(Guid contributionId);
        Task<IReadOnlyList<Contribution>> GetAllWithDocumentsAsync();
        Task AddAsync(Contribution contribution);
        void Update(Contribution contribution);
    }
}
