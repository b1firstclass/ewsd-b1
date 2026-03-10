using AutoMapper;
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
        private readonly IMapper _mapper;

        public CommentsService(
            ILogger<CommentsService> logger,
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService,
            IMapper mapper)
        {
            _logger = logger;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _mapper = mapper;
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

            var mapped = _mapper.Map<List<CommentInfo>>(pagedComments.Items);
            return new PagedResponse<CommentInfo>(mapped, pagedComments.TotalCount);
        }

        public async Task<CommentInfo?> GetCommentByIdAsync(Guid commentId)
        {
            if (commentId == Guid.Empty)
            {
                return null;
            }

            var comment = await _unitOfWork.CommentsRepository.GetByIdAsync(commentId);
            return comment == null ? null : _mapper.Map<CommentInfo>(comment);
        }

        public async Task<IReadOnlyList<CommentInfo>> GetCommentsByContributionIdAsync(Guid contributionId)
        {
            if (contributionId == Guid.Empty)
            {
                return Array.Empty<CommentInfo>();
            }

            var comments = await _unitOfWork.CommentsRepository.GetByContributionIdAsync(contributionId);
            return _mapper.Map<IReadOnlyList<CommentInfo>>(comments);
        }

        public async Task<CommentInfo> CreateCommentAsync(CommentCreateRequest request)
        {
            var currentUser = await GetAuthenticatedUserAsync();
            var currentUserId = currentUser.UserId;

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

            var isStudent = string.Equals(currentUser.Role.Name, RoleNames.Student, StringComparison.OrdinalIgnoreCase);
            var isCoordinator = string.Equals(currentUser.Role.Name, RoleNames.Coordinator, StringComparison.OrdinalIgnoreCase);

            if (!isStudent && !isCoordinator)
            {
                throw new UnauthorizedAccessException("Forbidden");
            }

            if (isStudent && contribution.UserId != currentUserId)
            {
                throw new UnauthorizedAccessException("Forbidden");
            }

            if (isCoordinator && contribution.ReviewedBy != currentUserId)
            {
                throw new UnauthorizedAccessException("Forbidden");
            }

            var now = DateTime.UtcNow;
            var comment = new Comment
            {
                CommentId = Guid.NewGuid(),
                ContributionId = request.ContributionId,
                Comment1 = request.Comment.Trim(),
                Poster = _currentUserService.UserName,
                IsActive = true,
                CreatedDate = now,
                CreatedBy = currentUserId
            };

            // Persist first coordinator comment metadata at contribution level.
            if (isCoordinator && !contribution.CommentedDate.HasValue && !contribution.CommentedBy.HasValue)
            {
                contribution.CommentedDate = now;
                contribution.CommentedBy = currentUserId;
                _unitOfWork.ContributionsRepository.Update(contribution);
            }

            await _unitOfWork.CommentsRepository.AddAsync(comment);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Comment created: {CommentId}", comment.CommentId);

            return _mapper.Map<CommentInfo>(comment);
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

            return _mapper.Map<CommentInfo>(comment);
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

        private async Task<User> GetAuthenticatedUserAsync()
        {
            var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Unauthorized");
            var currentUser = await _unitOfWork.UsersRepository.GetByUserIdAsync(currentUserId);

            if (currentUser == null)
            {
                throw new UnauthorizedAccessException("Unauthorized");
            }

            return currentUser;
        }

    }
}
