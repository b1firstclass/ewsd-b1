using AutoMapper;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Repositories;
using CMS.Application.Interfaces.Services;
using CMS.Application.Utilities;
using CMS.Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CMS.Application.Services
{
    public class FacultiesService : IFacultiesService
    {
        private readonly ILogger<FacultiesService> _logger;
        private readonly IMapper _mapper;
        private readonly AppSettings _appSettings;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        public FacultiesService(ILogger<FacultiesService> logger, IMapper mapper, IOptions<AppSettings> appSettings,
            IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
        {
            _logger = logger;
            _mapper = mapper;
            _appSettings = appSettings.Value;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<PagedResponse<FaculityInfo>> GetAllFacultiesAsync(PaginationRequest paginationRequest)
        {
            var skip = paginationRequest.GetSkipCount();
            var take = paginationRequest.PageSize;

            var pagedFaculties = await _unitOfWork.FacultiesRepository.GetPagedAsync(
                skip,
                take,
                paginationRequest.SearchKeyword,
                paginationRequest.IsActive);

            var mappedFaculties = _mapper.Map<List<FaculityInfo>>(pagedFaculties.Items);
            return new PagedResponse<FaculityInfo>(mappedFaculties, pagedFaculties.TotalCount);
        }

        public async Task<List<FaculityInfo>> GetAllActiveFacultiesAsync()
        {
            var faculties = await _unitOfWork.FacultiesRepository.GetAllActiveFacultiesAsync();
            return _mapper.Map<List<FaculityInfo>>(faculties);
        }

        public async Task<FaculityInfo?> GetFacultyByIdAsync(Guid facultyId)
        {
            if (facultyId == Guid.Empty)
            {
                return null;
            }

            var faculty = await _unitOfWork.Repository<Faculty>().GetByIdAsync(facultyId);
            return faculty == null ? null : _mapper.Map<FaculityInfo>(faculty);
        }

        public async Task<FaculityInfo> CreateFacultyAsync(FacultyCreateRequest request)
        {
            FacultyValidator.EnsureFacultyNameAvailable(request.Name, await FacultyNameExistsAsync(request.Name));

            var facultyEntity = _mapper.Map<Faculty>(request);
            facultyEntity.CreatedDate = DateTime.UtcNow;
            facultyEntity.CreatedBy = _currentUserService.UserId;

            await _unitOfWork.Repository<Faculty>().AddAsync(facultyEntity);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Faculty created: {FacultyId} - {FacultyName}", facultyEntity.FacultyId, facultyEntity.FacultyName);

            return _mapper.Map<FaculityInfo>(facultyEntity);
        }

        public async Task<FaculityInfo?> UpdateFacultyAsync(Guid facultyId, FacultyUpdateRequest request)
        {
            if (facultyId == Guid.Empty)
            {
                return null;
            }

            var faculty = await _unitOfWork.Repository<Faculty>().GetByIdAsync(facultyId);
            if (faculty == null)
            {
                _logger.LogWarning("Faculty not found for update: {FacultyId}", facultyId);
                return null;
            }

            FacultyValidator.EnsureFacultyNameAvailable(request.Name, await FacultyNameExistsAsync(request.Name, facultyId));

            faculty.FacultyName = request.Name;

            if (request.IsActive.HasValue)
            {
                faculty.IsActive = request.IsActive.Value;
            }

            faculty.ModifiedDate = DateTime.UtcNow;
            faculty.ModifiedBy = _currentUserService.UserId;

            _unitOfWork.Repository<Faculty>().Update(faculty);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Faculty updated: {FacultyId}", faculty.FacultyId);

            return _mapper.Map<FaculityInfo>(faculty);
        }

        public async Task<bool> DeleteFacultyAsync(Guid facultyId)
        {
            if (facultyId == Guid.Empty)
            {
                return false;
            }

            var faculty = await _unitOfWork.Repository<Faculty>().GetByIdAsync(facultyId);
            if (faculty == null)
            {
                _logger.LogWarning("Faculty not found for deletion: {FacultyId}", facultyId);
                return false;
            }

            if (await _unitOfWork.FacultiesRepository.HasUsersOrContributionsAsync(facultyId))
            {
                throw new InvalidOperationException("Faculty cannot be deleted because it has associated users or contributions.");
            }

            _unitOfWork.Repository<Faculty>().Remove(faculty);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Faculty deleted: {FacultyId}", faculty.FacultyId);
            return true;
        }

        private async Task<bool> FacultyNameExistsAsync(string facultyName, Guid? excludeFacultyId = null)
        {
            if (string.IsNullOrWhiteSpace(facultyName))
            {
                return false;
            }

            var faculties = await _unitOfWork.Repository<Faculty>().GetAllAsync();
            return faculties.Any(f =>
                string.Equals(f.FacultyName, facultyName, StringComparison.OrdinalIgnoreCase) &&
                (!excludeFacultyId.HasValue || f.FacultyId != excludeFacultyId.Value));
        }
    }
}
