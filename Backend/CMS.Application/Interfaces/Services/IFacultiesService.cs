using CMS.Application.Common;
using CMS.Application.DTOs;

namespace CMS.Application.Interfaces.Services
{
    public interface IFacultiesService
    {
        Task<PagedResponse<FaculityInfo>> GetAllFacultiesAsync(PaginationRequest paginationRequest);
        Task<FaculityInfo?> GetFacultyByIdAsync(string facultyId);
        Task<FaculityInfo> CreateFacultyAsync(FacultyCreateRequest request);
        Task<FaculityInfo?> UpdateFacultyAsync(string facultyId, FacultyUpdateRequest request);
        Task<bool> DeleteFacultyAsync(string facultyId);
    }
}
