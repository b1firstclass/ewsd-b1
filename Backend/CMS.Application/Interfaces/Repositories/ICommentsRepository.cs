using CMS.Application.Common;
using CMS.Domain.Entities;

namespace CMS.Application.Interfaces.Repositories
{
    public interface ICommentsRepository
    {
        Task<Comment?> GetByIdAsync(Guid commentId);
        Task<PagedResult<Comment>> GetPagedAsync(int skip, int take, Guid? contributionId = null, string? searchKeyword = null, bool? isActive = null);
        Task AddAsync(Comment comment);
        void Update(Comment comment);
        void Remove(Comment comment);
    }
}
