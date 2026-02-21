using CMS.Application.Common;
using CMS.Application.DTOs;

namespace CMS.Application.Interfaces.Services
{
    public interface ICommentsService
    {
        Task<PagedResponse<CommentInfo>> GetAllCommentsAsync(PaginationRequest paginationRequest, Guid? contributionId = null);
        Task<CommentInfo?> GetCommentByIdAsync(Guid commentId);
        Task<CommentInfo> CreateCommentAsync(CommentCreateRequest request);
        Task<CommentInfo?> UpdateCommentAsync(Guid commentId, CommentUpdateRequest request);
        Task<bool> DeleteCommentAsync(Guid commentId);
    }
}
