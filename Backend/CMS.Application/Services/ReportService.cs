using AutoMapper;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Repositories;
using CMS.Application.Interfaces.Services;
using Microsoft.Extensions.Logging;

namespace CMS.Application.Services
{
    public class ReportService : IReportService
    {
        private readonly ILogger<ReportService> _logger;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public ReportService(ILogger<ReportService> logger, IMapper mapper, IUnitOfWork unitOfWork)
        {
            _logger = logger;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<IReadOnlyList<BrowserListDto>> GetBrowserListAsync()
        {
            var data = await _unitOfWork.ReportRepository.GetBrowserListAsync();
            return _mapper.Map<List<BrowserListDto>>(data).OrderByDescending(b => b.Count).ToList();
        }

        public async Task<IReadOnlyList<ContributionCountByFacultyAcademicYearDto>> GetContributionCountByFacultyAcademicYearAsync()
        {
            var data = await _unitOfWork.ReportRepository.GetContributionCountByFacultyAcademicYearAsync();
            return _mapper.Map<List<ContributionCountByFacultyAcademicYearDto>>(data).OrderByDescending(c => c.TotalContributions).ToList();
        }

        public async Task<IReadOnlyList<ContributionPercentageByFacultyAcademicYearDto>> GetContributionPercentageByFacultyAcademicYearAsync()
        {
            var data = await _unitOfWork.ReportRepository.GetContributionPercentageByFacultyAcademicYearAsync();
            return _mapper.Map<List<ContributionPercentageByFacultyAcademicYearDto>>(data).OrderByDescending(c => c.ContributionPercentage).ToList();
        }

        public async Task<PagedResponse<ContributionsWithoutCommentDto>> GetContributionsWithoutCommentAsync(PaginationRequest paginationRequest)
        {
            var result = await _unitOfWork.ReportRepository.GetContributionsWithoutCommentAsync(paginationRequest.GetSkipCount(), paginationRequest.PageSize);
            var items = _mapper.Map<List<ContributionsWithoutCommentDto>>(result.Items);
            return new PagedResponse<ContributionsWithoutCommentDto>(items, result.TotalCount);
        }

        public async Task<PagedResponse<ContributionsWithoutCommentDto>> GetContributionsWithoutCommentAfter14DaysAsync(PaginationRequest paginationRequest)
        {
            var result = await _unitOfWork.ReportRepository.GetContributionsWithoutCommentAfter14DaysAsync(paginationRequest.GetSkipCount(), paginationRequest.PageSize);
            var items = _mapper.Map<List<ContributionsWithoutCommentDto>>(result.Items);
            return new PagedResponse<ContributionsWithoutCommentDto>(items, result.TotalCount);
        }

        public async Task<IReadOnlyList<PageAccessCountDto>> GetPageAccessCountAsync()
        {
            var data = await _unitOfWork.ReportRepository.GetPageAccessCountAsync();
            return _mapper.Map<List<PageAccessCountDto>>(data);
        }

        public async Task<IReadOnlyList<UserActivityCountDto>> GetUserActivityCountAsync()
        {
            var data = await _unitOfWork.ReportRepository.GetUserActivityCountAsync();
            return _mapper.Map<List<UserActivityCountDto>>(data);
        }

        public async Task<ContributionStatusSummaryDto> GetContributionCountByStatusAsync(Guid userId)
        {
            var items = await _unitOfWork.ReportRepository.GetContributionCountByStatusAsync(userId);
            return new ContributionStatusSummaryDto
            {
                Items = items,
                TotalCount = items.Sum(x => x.Count)
            }; 
        }

        public async Task<IReadOnlyList<FacultyContributionStatusSummaryDto>> GetContributionCountByStatusPerFacultyAsync()
        {
            var raw = await _unitOfWork.ReportRepository.GetContributionCountByStatusPerFacultyAsync();
            return raw
                .GroupBy(r => new { r.FacultyId, r.FacultyName })
                .Select(g => new FacultyContributionStatusSummaryDto
                {
                    FacultyId = g.Key.FacultyId,
                    FacultyName = g.Key.FacultyName,
                    Items = g.Select(x => new ContributionStatusCountDto { Status = x.Status, Count = x.Count }).ToList(),
                    TotalCount = g.Sum(x => x.Count)
                })
                .OrderBy(x => x.FacultyName)
                .ToList();
        }

        public async Task<IReadOnlyList<FacultyUserCountDto>> GetUserCountPerFacultyAsync()
        {
            return await _unitOfWork.ReportRepository.GetUserCountPerFacultyAsync();
        }

        public async Task<IReadOnlyList<FacultyUserCountDto>> GetStudentCountPerFacultyAsync(IReadOnlyList<Guid> facultyIds)
        {
            return await _unitOfWork.ReportRepository.GetStudentCountPerFacultyAsync(facultyIds);
        }

        public async Task<IReadOnlyList<TopContributorDto>> GetTopContributorsAsync(Guid? contributionWindowId)
        {
            return await _unitOfWork.ReportRepository.GetTopContributorsAsync(contributionWindowId);
        }
    }
}
