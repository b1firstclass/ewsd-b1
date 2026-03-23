using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
using CMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
namespace CMS.Infrastructure.Repositories
{
    public class ReportRepository : IReportRepository
    {
        private readonly AppDbContext _context;

        public ReportRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<vw_BrowserList>> GetBrowserListAsync()
        {
            return await _context.vw_BrowserLists
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IReadOnlyList<vw_ContributionCountByFacultyAcademicYear>> GetContributionCountByFacultyAcademicYearAsync()
        {
            return await _context.vw_ContributionCountByFacultyAcademicYears
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IReadOnlyList<vw_ContributionPercentageByFacultyAcademicYear>> GetContributionPercentageByFacultyAcademicYearAsync()
        {
            return await _context.vw_ContributionPercentageByFacultyAcademicYears
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<PagedResult<vw_ContributionsWithoutComment>> GetContributionsWithoutCommentAsync(int skip, int take)
        {
            var query = _context.vw_ContributionsWithoutComments.AsNoTracking();
            var totalCount = await query.CountAsync();
            var items = await query.Skip(skip).Take(take).ToListAsync();
            return new PagedResult<vw_ContributionsWithoutComment>(items, totalCount);
        }

        public async Task<PagedResult<vw_ContributionsWithoutCommentAfter14Day>> GetContributionsWithoutCommentAfter14DaysAsync(int skip, int take)
        {
            var query = _context.vw_ContributionsWithoutCommentAfter14Days.AsNoTracking();
            var totalCount = await query.CountAsync();
            var items = await query.Skip(skip).Take(take).ToListAsync();
            return new PagedResult<vw_ContributionsWithoutCommentAfter14Day>(items, totalCount);
        }

        public async Task<IReadOnlyList<vw_PageAccessCount>> GetPageAccessCountAsync()
        {
            return await _context.vw_PageAccessCounts
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IReadOnlyList<vw_UserActivityCount>> GetUserActivityCountAsync()
        {
            return await _context.vw_UserActivityCounts
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IReadOnlyList<ContributionStatusCountDto>> GetContributionCountByStatusAsync(Guid userId)
        {
            return await _context.Contributions
                .AsNoTracking()
                .Where(c => c.UserId == userId && c.IsActive)
                .GroupBy(c => c.Status)
                .Select(g => new ContributionStatusCountDto
                {
                    Status = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();
        }

        public async Task<IReadOnlyList<FacultyContributionStatusRawDto>> GetContributionCountByStatusPerFacultyAsync()
        {
            return await (
                from c in _context.Contributions.AsNoTracking().Where(c => c.IsActive)
                join f in _context.Faculties.AsNoTracking() on c.FacultyId equals f.FacultyId
                group c by new { f.FacultyId, f.FacultyName, c.Status } into g
                select new FacultyContributionStatusRawDto
                {
                    FacultyId = g.Key.FacultyId,
                    FacultyName = g.Key.FacultyName,
                    Status = g.Key.Status,
                    Count = g.Count()
                }
            ).ToListAsync();
        }

        public async Task<IReadOnlyList<FacultyUserCountDto>> GetUserCountPerFacultyAsync()
        {
            return await _context.Faculties
                .AsNoTracking()
                .Where(f => f.IsActive)
                .Select(f => new FacultyUserCountDto
                {
                    FacultyId = f.FacultyId,
                    FacultyName = f.FacultyName,
                    Count = f.Users.Count(u => u.IsActive)
                })
                .OrderBy(f => f.FacultyName)
                .ToListAsync();
        }

        public async Task<IReadOnlyList<FacultyUserCountDto>> GetStudentCountPerFacultyAsync(IReadOnlyList<Guid> facultyIds)
        {
            return await _context.Faculties
                .AsNoTracking()
                .Where(f => facultyIds.Contains(f.FacultyId) && f.IsActive)
                .Select(f => new FacultyUserCountDto
                {
                    FacultyId = f.FacultyId,
                    FacultyName = f.FacultyName,
                    Count = f.Users.Count(u => u.IsActive && u.Role.Name == RoleNames.Student)
                })
                .OrderBy(f => f.FacultyName)
                .ToListAsync();
        }

        public async Task<IReadOnlyList<TopContributorDto>> GetTopContributorsAsync(Guid? contributionWindowId)
        {
            var query = from c in _context.Contributions.AsNoTracking().Where(c => c.IsActive)
                        join u in _context.Users.AsNoTracking() on c.UserId equals u.UserId
                        join r in _context.Roles.AsNoTracking() on u.RoleId equals r.RoleId
                        join f in _context.Faculties.AsNoTracking() on c.FacultyId equals f.FacultyId
                        where r.Name == RoleNames.Student
                        select new { c.UserId, c.ContributionWindowId, u.FullName, f.FacultyName };

            if (contributionWindowId.HasValue)
            {
                query = query.Where(x => x.ContributionWindowId == contributionWindowId.Value);
            }

            return await query
                .GroupBy(x => new { x.UserId, x.FullName, x.FacultyName })
                .Select(g => new TopContributorDto
                {
                    UserId = g.Key.UserId,
                    FullName = g.Key.FullName,
                    FacultyName = g.Key.FacultyName,
                    ContributionCount = g.Count()
                })
                .OrderByDescending(t => t.ContributionCount)
                .Take(10)
                .ToListAsync();
        }
    }
}
