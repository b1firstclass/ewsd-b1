using CMS.Api.Security;
using CMS.Api.Utilities;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ILogger<UsersController> _logger;
        private readonly IUsersService _userService;
        private readonly ICurrentUserService _currentUserService;

        public UsersController(ILogger<UsersController> logger, IUsersService usersService, ICurrentUserService currentUserService)
        {
            _logger = logger;
            _userService = usersService;
            _currentUserService = currentUserService;
        }

        [HasPermission(PermissionNames.UsersRead)]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers([FromQuery] PaginationRequest? paginationRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                paginationRequest ??= new PaginationRequest();

                var users = await _userService.GetAllUsersAsync(paginationRequest);

                return users.ToApiResponse(ApiResponseMessages.Retrieved("Users"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("users"), 500);
            }
        }

        [HasPermission(PermissionNames.UsersRead)]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("User"), 400);
                }

                var user = await _userService.GetUserByIdAsync(id);
                if (user == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("User"), 404);
                }

                return user.ToApiResponse(ApiResponseMessages.Retrieved("User"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user {UserId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("user"), 500);
            }
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var loginResponse = await _userService.LoginAsync(request);
                return loginResponse.ToApiResponse("Login successful");
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid login attempt for {LoginId}", request.LoginId);
                return this.ToErrorResponse(ex.Message, 401);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging in user {LoginId}", request.LoginId);
                return this.ToErrorResponse("An error occurred while logging in", 500);
            }
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = _currentUserService.UserId;
                if (!userId.HasValue)
                {
                    return this.ToErrorResponse(ApiResponseMessages.Unauthorized, 401);
                }

                var user = await _userService.GetUserProfileById(userId.Value);
                if (user == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("User"), 404);
                }

                return user.ToApiResponse(ApiResponseMessages.Retrieved("Profile"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving profile");
                return this.ToErrorResponse(ApiResponseMessages.ErrorRetrieving("profile"), 500);
            }
        }

        [AllowAnonymous]
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken(RefreshTokenRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var refreshResponse = await _userService.RefreshTokenAsync(request);
                return refreshResponse.ToApiResponse("Token refreshed successfully");
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid refresh token attempt");
                return this.ToErrorResponse(ex.Message, 401);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing token");
                return this.ToErrorResponse("An error occurred while refreshing the token", 500);
            }
        }

        [HasPermission(PermissionNames.UsersCreate)]
        [HttpPost]
        public async Task<IActionResult> RegisterUser(UserRegisterRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var userEntity = await _userService.CreateUserAsync(request);

                return userEntity.ToApiResponse(ApiResponseMessages.Created("User"), 201);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while creating user");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering a new user");
                return this.ToErrorResponse(ApiResponseMessages.ErrorCreating("user"), 500);
            }
        }

        [HasPermission(PermissionNames.UsersUpdate)]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateUser(Guid id, UserUpdateRequest request)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("User"), 400);
                }

                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse(ApiResponseMessages.ValidationFailed, 400, ModelState);
                }

                var updatedUser = await _userService.UpdateUserAsync(id, request);
                if (updatedUser == null)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("User"), 404);
                }

                return updatedUser.ToApiResponse(ApiResponseMessages.Updated("User"));
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while updating user {UserId}", id);
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorUpdating("user"), 500);
            }
        }

        [HasPermission(PermissionNames.UsersDelete)]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse(ApiResponseMessages.IdRequired("User"), 400);
                }

                var deleted = await _userService.DeleteUserAsync(id);
                if (!deleted)
                {
                    return this.ToErrorResponse(ApiResponseMessages.NotFound("User"), 404);
                }

                return this.ToSuccessResponse(ApiResponseMessages.Deleted("User"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", id);
                return this.ToErrorResponse(ApiResponseMessages.ErrorDeleting("user"), 500);
            }
        }
    }
}
