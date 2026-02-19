using System;
using CMS.Application.Common;
using CMS.Application.DTOs;

namespace CMS.Application.Interfaces.Services
{
    public interface IFacultiesService
    {
        Task<PagedResponse<FaculityInfo>> GetAllFacultiesAsync(PaginationRequest paginationRequest);
        Task<FaculityInfo?> GetFacultyByIdAsync(Guid facultyId);
        Task<FaculityInfo> CreateFacultyAsync(FacultyCreateRequest request);
        Task<FaculityInfo?> UpdateFacultyAsync(Guid facultyId, FacultyUpdateRequest request);
        Task<bool> DeleteFacultyAsync(Guid facultyId);
    }
}
