using CMS.Application.DTOs;

namespace CMS.Application.Interfaces.Services
{
    public interface IUsersService
    {
        Task<List<UserInfo>> GetAllUsersAsync();
        Task<UserInfo?> GetUserByIdAsync(string userId);
        Task<UserInfo> CreateUserAsync(UserRegisterRequest request);
        Task<UserInfo?> UpdateUserAsync(string userId, UserUpdateRequest request);
        Task<bool> DeleteUserAsync(string userId);
        Task<UserLoginResponse> LoginAsync(UserLoginRequest request);
    }
}
