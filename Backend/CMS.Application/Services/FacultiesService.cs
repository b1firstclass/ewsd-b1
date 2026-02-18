using System;
using System.Linq;
using AutoMapper;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Repositories;
using CMS.Application.Interfaces.Services;
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
        public FacultiesService(ILogger<FacultiesService> logger, IMapper mapper, IOptions<AppSettings> appSettings,
            IUnitOfWork unitOfWork)
        {
            _logger = logger;
            _mapper = mapper;
            _appSettings = appSettings.Value;
            _unitOfWork = unitOfWork;
        }

        public async Task<PagedResponse<FaculityInfo>> GetAllFacultiesAsync(PaginationRequest paginationRequest)
        {
            var skip = paginationRequest.GetSkipCount();
            var take = paginationRequest.PageSize;

            var pagedFaculties = await _unitOfWork.FacultiesRepository.GetPagedAsync(skip, take);

            var mappedFaculties = _mapper.Map<List<FaculityInfo>>(pagedFaculties.Items);
            return new PagedResponse<FaculityInfo>(mappedFaculties, pagedFaculties.TotalCount);
        }

        public async Task<FaculityInfo?> GetFacultyByIdAsync(string facultyId)
        {
            var faculty = await _unitOfWork.Repository<Faculty>().GetByIdAsync(facultyId);
            return faculty == null ? null : _mapper.Map<FaculityInfo>(faculty);
        }

        public async Task<FaculityInfo> CreateFacultyAsync(FacultyCreateRequest request)
        {
            if (await FacultyNameExistsAsync(request.Name))
            {
                throw new InvalidOperationException($"Faculty with name '{request.Name}' already exists");
            }

            var facultyEntity = _mapper.Map<Faculty>(request);
            facultyEntity.CreatedDate = DateTime.UtcNow;

            await _unitOfWork.Repository<Faculty>().AddAsync(facultyEntity);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Faculty created: {FacultyId} - {FacultyName}", facultyEntity.FacultyId, facultyEntity.FacultyName);

            return _mapper.Map<FaculityInfo>(facultyEntity);
        }

        public async Task<FaculityInfo?> UpdateFacultyAsync(string facultyId, FacultyUpdateRequest request)
        {
            var faculty = await _unitOfWork.Repository<Faculty>().GetByIdAsync(facultyId);
            if (faculty == null)
            {
                _logger.LogWarning("Faculty not found for update: {FacultyId}", facultyId);
                return null;
            }

            if (await FacultyNameExistsAsync(request.Name, facultyId))
            {
                throw new InvalidOperationException($"Faculty with name '{request.Name}' already exists");
            }

            faculty.FacultyName = request.Name;
            faculty.ModifiedDate = DateTime.UtcNow;

            _unitOfWork.Repository<Faculty>().Update(faculty);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Faculty updated: {FacultyId}", faculty.FacultyId);

            return _mapper.Map<FaculityInfo>(faculty);
        }

        public async Task<bool> DeleteFacultyAsync(string facultyId)
        {
            var faculty = await _unitOfWork.Repository<Faculty>().GetByIdAsync(facultyId);
            if (faculty == null)
            {
                _logger.LogWarning("Faculty not found for deletion: {FacultyId}", facultyId);
                return false;
            }

            faculty.IsActive = false;
            faculty.ModifiedDate = DateTime.UtcNow;
            _unitOfWork.Repository<Faculty>().Update(faculty);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Faculty soft deleted (IsActive=false): {FacultyId}", faculty.FacultyId);
            return true;
        }

        private async Task<bool> FacultyNameExistsAsync(string facultyName, string? excludeFacultyId = null)
        {
            if (string.IsNullOrWhiteSpace(facultyName))
            {
                return false;
            }

            var faculties = await _unitOfWork.Repository<Faculty>().GetAllAsync();
            return faculties.Any(f =>
                f.IsActive &&
                string.Equals(f.FacultyName, facultyName, StringComparison.OrdinalIgnoreCase) &&
                (excludeFacultyId == null || !string.Equals(f.FacultyId, excludeFacultyId, StringComparison.OrdinalIgnoreCase)));
        }
    }
}
