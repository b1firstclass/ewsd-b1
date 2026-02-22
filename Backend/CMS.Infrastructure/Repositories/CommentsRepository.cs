using System;
using System.Linq;
using System.Threading.Tasks;
using CMS.Application.Common;
using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
using CMS.Infrastructure.Extensions;
using CMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CMS.Infrastructure.Repositories
{
    public class CommentsRepository : ICommentsRepository
    {
        private readonly AppDbContext _context;

        public CommentsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Comment?> GetByIdAsync(Guid commentId)
        {
            if (commentId == Guid.Empty)
            {
                return null;
            }

            return await _context.Comments
                .FirstOrDefaultAsync(comment => comment.CommentId == commentId && comment.IsActive);
        }

        public async Task<IReadOnlyList<Comment>> GetByContributionIdAsync(Guid contributionId)
        {
            if (contributionId == Guid.Empty)
            {
                return Array.Empty<Comment>();
            }

            return await _context.Comments
                .AsNoTracking()
                .Where(comment => comment.ContributionId == contributionId && comment.IsActive)
                .OrderByDescending(comment => comment.CreatedDate)
                .ToListAsync();
        }

        public async Task<PagedResult<Comment>> GetPagedAsync(int skip, int take, Guid? contributionId = null, string? searchKeyword = null, bool? isActive = null)
        {
            if (skip < 0)
            {
                skip = 0;
            }

            var query = _context.Comments
                .AsNoTracking()
                .ApplySearch(searchKeyword);

            if (contributionId.HasValue && contributionId.Value != Guid.Empty)
            {
                query = query.Where(comment => comment.ContributionId == contributionId.Value);
            }

            if (isActive.HasValue)
            {
                query = query.Where(comment => comment.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(comment => comment.CreatedDate)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            return new PagedResult<Comment>(items, totalCount);
        }

        public async Task AddAsync(Comment comment)
        {
            await _context.Comments.AddAsync(comment);
        }

        public void Update(Comment comment)
        {
            _context.Comments.Update(comment);
        }

        public void Remove(Comment comment)
        {
            _context.Comments.Remove(comment);
        }
    }
}
