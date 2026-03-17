using CMS.Application.Common;
using CMS.Application.DTOs;

namespace CMS.Application.Interfaces.Services
{
    public interface IUsersService
    {
        Task<PagedResponse<UserInfo>> GetAllUsersAsync(PaginationRequest paginationRequest);
        Task<UserInfo?> GetUserByIdAsync(Guid userId);
        Task<UserProfile?> GetUserProfileById(Guid userId);
        Task<UserInfo> CreateUserAsync(UserRegisterRequest request);
        Task<UserInfo?> UpdateUserAsync(Guid userId, UserUpdateRequest request);
        Task<bool> DeleteUserAsync(Guid userId);
        Task<UserLoginResponse> LoginAsync(UserLoginRequest request);
        Task<RefreshTokenResponse> RefreshTokenAsync(RefreshTokenRequest request);
        Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
    }
}
