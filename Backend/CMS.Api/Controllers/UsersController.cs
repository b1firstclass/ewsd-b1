using System;
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
    //[Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ILogger<UsersController> _logger;
        private readonly IUsersService _userService;

        public UsersController(ILogger<UsersController> logger, IUsersService usersService)
        {
            _logger = logger;
            _userService = usersService;
        }

        //[HasPermission(PermissionNames.UsersRead)]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers([FromQuery] PaginationRequest? paginationRequest)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse("Validation failed", 400, ModelState);
                }

                paginationRequest ??= new PaginationRequest();

                var users = await _userService.GetAllUsersAsync(paginationRequest);

                return users.ToApiResponse("Users retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return this.ToErrorResponse("An error occurred while retrieving users", 500);
            }
        }

        //[HasPermission(PermissionNames.UsersRead)]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse("User id is required", 400);
                }

                var user = await _userService.GetUserByIdAsync(id);
                if (user == null)
                {
                    return this.ToErrorResponse("User not found", 404);
                }

                return user.ToApiResponse("User retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user {UserId}", id);
                return this.ToErrorResponse("An error occurred while retrieving the user", 500);
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
                    return this.ToErrorResponse("Validation failed", 400, ModelState);
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

        [AllowAnonymous]
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken(RefreshTokenRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse("Validation failed", 400, ModelState);
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

        //[HasPermission(PermissionNames.UsersCreate)]
        [HttpPost]
        public async Task<IActionResult> RegisterUser(UserRegisterRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse("Validation failed", 400, ModelState);
                }

                var userEntity = await _userService.CreateUserAsync(request);

                return userEntity.ToApiResponse("User created successfully", 201);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while creating user");
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering a new user");
                return this.ToErrorResponse("An error occurred while registering the user", 500);
            }
        }

        //[HasPermission(PermissionNames.UsersUpdate)]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateUser(Guid id, UserUpdateRequest request)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse("User id is required", 400);
                }

                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse("Validation failed", 400, ModelState);
                }

                var updatedUser = await _userService.UpdateUserAsync(id, request);
                if (updatedUser == null)
                {
                    return this.ToErrorResponse("User not found", 404);
                }

                return updatedUser.ToApiResponse("User updated successfully");
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Business validation failed while updating user {UserId}", id);
                return this.ToErrorResponse(ex.Message, 409);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", id);
                return this.ToErrorResponse("An error occurred while updating the user", 500);
            }
        }

        //[HasPermission(PermissionNames.UsersDelete)]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return this.ToErrorResponse("User id is required", 400);
                }

                var deleted = await _userService.DeleteUserAsync(id);
                if (!deleted)
                {
                    return this.ToErrorResponse("User not found", 404);
                }

                return this.ToSuccessResponse("User deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user {UserId}", id);
                return this.ToErrorResponse("An error occurred while deleting the user", 500);
            }
        }
    }
}
