using CMS.Api.Utilities;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Services;
using CMS.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ILogger<UsersController> _logger;
        private readonly IUsersService _userService;

        public UsersController(ILogger<UsersController> logger, IUsersService usersService)
        {
            _logger = logger;
            _userService = usersService;
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> RegisterUser(UserRegisterRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return this.ToErrorResponse("Validation failed", 400, ModelState);
                }

                var loginExists = _userService.IsLoginIdExists(request.LoginId);
                if (loginExists)
                {
                    return this.ToErrorResponse($"LoginId '{request.LoginId}' already exists", 409);
                }

                var userEntity = await _userService.RegisterUserAsync(request);

                _logger.LogInformation("User created: {UserId} - {LoginId}", userEntity.UserId, userEntity.LoginId);

                return userEntity.ToApiResponse("User created successfully", 201);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering a new user");
                return this.ToErrorResponse("An error occurred while registering the user", 500);
            }
        }

    }
}
