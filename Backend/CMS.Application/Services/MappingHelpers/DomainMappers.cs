using CMS.Application.DTOs;
using CMS.Domain.Entities;

namespace CMS.Application.Services.MappingHelpers
{
    public interface IContributionMapper
    {
        ContributionInfo MapToInfo(Contribution contribution);
    }

    public class ContributionMapper : IContributionMapper
    {
        public ContributionInfo MapToInfo(Contribution contribution)
        {
            return new ContributionInfo
            {
                Id = contribution.ContributionId,
                ContributionWindowId = contribution.ContributionWindowId,
                Subject = contribution.Subject,
                Description = contribution.Description,
                Status = contribution.Status,
                CreatedDate = contribution.CreatedDate,
                ModifiedDate = contribution.ModifiedDate
            };
        }
    }

    public interface ICommentMapper
    {
        CommentInfo MapToInfo(Comment comment);
    }

    public class CommentMapper : ICommentMapper
    {
        public CommentInfo MapToInfo(Comment comment)
        {
            return new CommentInfo
            {
                Id = comment.CommentId,
                ContributionId = comment.ContributionId,
                Comment = comment.Comment1,
                IsActive = comment.IsActive,
                CreatedDate = comment.CreatedDate,
                CreatedBy = comment.CreatedBy,
                ModifiedDate = comment.ModifiedDate,
                ModifiedBy = comment.ModifiedBy
            };
        }
    }
}
