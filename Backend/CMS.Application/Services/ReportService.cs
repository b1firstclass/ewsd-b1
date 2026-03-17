using AutoMapper;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Repositories;
using CMS.Application.Interfaces.Services;
using CMS.Domain.Entities;
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
            var data = await _unitOfWork.Repository<vw_BrowserList>().GetAllAsync();
            return _mapper.Map<List<BrowserListDto>>(data);
        }

        public async Task<IReadOnlyList<ContributionCountByFacultyAcademicYearDto>> GetContributionCountByFacultyAcademicYearAsync()
        {
            var data = await _unitOfWork.Repository<vw_ContributionCountByFacultyAcademicYear>().GetAllAsync();
            return _mapper.Map<List<ContributionCountByFacultyAcademicYearDto>>(data);
        }

        public async Task<IReadOnlyList<ContributionPercentageByFacultyAcademicYearDto>> GetContributionPercentageByFacultyAcademicYearAsync()
        {
            var data = await _unitOfWork.Repository<vw_ContributionPercentageByFacultyAcademicYear>().GetAllAsync();
            return _mapper.Map<List<ContributionPercentageByFacultyAcademicYearDto>>(data);
        }

        public async Task<IReadOnlyList<ContributionsWithoutCommentDto>> GetContributionsWithoutCommentAsync()
        {
            var data = await _unitOfWork.Repository<vw_ContributionsWithoutComment>().GetAllAsync();
            return _mapper.Map<List<ContributionsWithoutCommentDto>>(data);
        }

        public async Task<IReadOnlyList<ContributionsWithoutCommentDto>> GetContributionsWithoutCommentAfter14DaysAsync()
        {
            var data = await _unitOfWork.Repository<vw_ContributionsWithoutCommentAfter14Day>().GetAllAsync();
            return _mapper.Map<List<ContributionsWithoutCommentDto>>(data);
        }

        public async Task<IReadOnlyList<PageAccessCountDto>> GetPageAccessCountAsync()
        {
            var data = await _unitOfWork.Repository<vw_PageAccessCount>().GetAllAsync();
            return _mapper.Map<List<PageAccessCountDto>>(data);
        }

        public async Task<IReadOnlyList<UserActivityCountDto>> GetUserActivityCountAsync()
        {
            var data = await _unitOfWork.Repository<vw_UserActivityCount>().GetAllAsync();
            return _mapper.Map<List<UserActivityCountDto>>(data);
        }
    }
}
