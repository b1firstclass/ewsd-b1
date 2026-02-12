using CMS.Application.DTOs;
using CMS.Domain.Entities;

namespace CMS.Application.Interfaces.Services
{
    public interface IUsersService
    {
        bool IsLoginIdExists(string loginId);
        Task<User> RegisterUserAsync(UserRegisterRequest request);
    }
}
