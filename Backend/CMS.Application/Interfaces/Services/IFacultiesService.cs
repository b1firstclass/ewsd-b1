using CMS.Application.DTOs;

namespace CMS.Application.Interfaces.Services
{
    public interface IFacultiesService
    {
        Task<List<FaculityInfo>> GetAllFacultiesAsync();
    }
}
