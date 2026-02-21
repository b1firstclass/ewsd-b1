using System;
using System.Linq;
using System.Threading.Tasks;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Repositories;
using CMS.Application.Interfaces.Services;
using CMS.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace CMS.Application.Services
{
    public class CommentsService : ICommentsService
    {
        private readonly ILogger<CommentsService> _logger;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public CommentsService(
            ILogger<CommentsService> logger,
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService)
        {
            _logger = logger;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<PagedResponse<CommentInfo>> GetAllCommentsAsync(PaginationRequest paginationRequest, Guid? contributionId = null)
        {
            var skip = paginationRequest.GetSkipCount();
            var take = paginationRequest.PageSize;

            var pagedComments = await _unitOfWork.CommentsRepository.GetPagedAsync(
                skip,
                take,
                contributionId,
                paginationRequest.SearchKeyword,
                paginationRequest.IsActive);

            var mapped = pagedComments.Items.Select(MapCommentInfo).ToList();
            return new PagedResponse<CommentInfo>(mapped, pagedComments.TotalCount);
        }

        public async Task<CommentInfo?> GetCommentByIdAsync(Guid commentId)
        {
            if (commentId == Guid.Empty)
            {
                return null;
            }

            var comment = await _unitOfWork.CommentsRepository.GetByIdAsync(commentId);
            return comment == null ? null : MapCommentInfo(comment);
        }

        public async Task<IReadOnlyList<CommentInfo>> GetCommentsByContributionIdAsync(Guid contributionId)
        {
            if (contributionId == Guid.Empty)
            {
                return Array.Empty<CommentInfo>();
            }

            var comments = await _unitOfWork.CommentsRepository.GetByContributionIdAsync(contributionId);
            return comments.Select(MapCommentInfo).ToList();
        }

        public async Task<CommentInfo> CreateCommentAsync(CommentCreateRequest request)
        {
            var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Unauthorized");

            if (request.ContributionId == Guid.Empty)
            {
                throw new ArgumentException("Contribution id is required");
            }

            if (string.IsNullOrWhiteSpace(request.Comment))
            {
                throw new ArgumentException("Comment is required");
            }

            var contribution = await _unitOfWork.ContributionsRepository.GetByIdAsync(request.ContributionId);
            if (contribution == null)
            {
                throw new InvalidOperationException("Contribution not found");
            }

            var now = DateTime.UtcNow;
            var comment = new Comment
            {
                CommentId = Guid.NewGuid(),
                ContributionId = request.ContributionId,
                Comment1 = request.Comment.Trim(),
                IsActive = true,
                CreatedDate = now,
                CreatedBy = currentUserId
            };

            await _unitOfWork.CommentsRepository.AddAsync(comment);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Comment created: {CommentId}", comment.CommentId);

            return MapCommentInfo(comment);
        }

        public async Task<CommentInfo?> UpdateCommentAsync(Guid commentId, CommentUpdateRequest request)
        {
            if (commentId == Guid.Empty)
            {
                return null;
            }

            var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Unauthorized");

            var comment = await _unitOfWork.CommentsRepository.GetByIdAsync(commentId);
            if (comment == null)
            {
                _logger.LogWarning("Comment not found for update: {CommentId}", commentId);
                return null;
            }

            if (comment.CreatedBy.HasValue && comment.CreatedBy.Value != currentUserId)
            {
                throw new UnauthorizedAccessException("Forbidden");
            }

            if (request.Comment != null && string.IsNullOrWhiteSpace(request.Comment))
            {
                throw new ArgumentException("Comment is required");
            }

            if (!string.IsNullOrWhiteSpace(request.Comment))
            {
                comment.Comment1 = request.Comment.Trim();
            }

            if (request.IsActive.HasValue)
            {
                comment.IsActive = request.IsActive.Value;
            }

            comment.ModifiedDate = DateTime.UtcNow;
            comment.ModifiedBy = currentUserId;

            _unitOfWork.CommentsRepository.Update(comment);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Comment updated: {CommentId}", comment.CommentId);

            return MapCommentInfo(comment);
        }

        public async Task<bool> DeleteCommentAsync(Guid commentId)
        {
            if (commentId == Guid.Empty)
            {
                return false;
            }

            var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Unauthorized");

            var comment = await _unitOfWork.CommentsRepository.GetByIdAsync(commentId);
            if (comment == null)
            {
                _logger.LogWarning("Comment not found for deletion: {CommentId}", commentId);
                return false;
            }

            if (comment.CreatedBy.HasValue && comment.CreatedBy.Value != currentUserId)
            {
                throw new UnauthorizedAccessException("Forbidden");
            }

            _unitOfWork.CommentsRepository.Remove(comment);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Comment deleted: {CommentId}", comment.CommentId);
            return true;
        }

        private static CommentInfo MapCommentInfo(Comment comment)
        {
            return new CommentInfo
            {
                Id = comment.CommentId,
                ContributionId = comment.ContributionId,
                Comment = comment.Comment1,
                IsActive = comment.IsActive,
                CreatedBy = comment.CreatedBy,
                ModifiedBy = comment.ModifiedBy,
                CreatedDate = DateTimeHelper.NormalizeToUtc(comment.CreatedDate),
                ModifiedDate = DateTimeHelper.NormalizeToUtc(comment.ModifiedDate)
            };
        }
    }
}
