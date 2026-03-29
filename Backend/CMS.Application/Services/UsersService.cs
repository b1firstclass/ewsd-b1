using AutoMapper;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Repositories;
using CMS.Application.Interfaces.Services;
using CMS.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace CMS.Application.Services
{
    public class UsersService : IUsersService
    {
        private readonly ILogger<UsersService> _logger;
        private readonly IMapper _mapper;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly ITokenService _tokenService;
        private readonly IUserValidationService _userValidationService;
        private readonly IUserAssignmentService _userAssigmentService;
        private readonly IEmailService _emailService;

        public UsersService(ILogger<UsersService> logger, IMapper mapper, IPasswordHasher<User> passwordHasher,
            IUnitOfWork unitOfWork, ICurrentUserService currentUserService, ITokenService tokenService,
            IUserValidationService userValidationService, IUserAssignmentService userAssignmentService,
            IEmailService emailService)
        {
            _logger = logger;
            _mapper = mapper;
            _passwordHasher = passwordHasher;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _tokenService = tokenService;
            _userValidationService = userValidationService;
            _userAssigmentService = userAssignmentService;
            _emailService = emailService;
        }

        public async Task<PagedResponse<UserInfo>> GetAllUsersAsync(UserPaginationRequest paginationRequest)
        {
            var skip = paginationRequest.GetSkipCount();
            var take = paginationRequest.PageSize;

            var pagedUsers = await _unitOfWork.UsersRepository.GetPagedAsync(
                skip,
                take,
                paginationRequest.SearchKeyword,
                paginationRequest.IsActive,
                paginationRequest.RoleId,
                paginationRequest.FacultyId);

            var mappedUsers = _mapper.Map<List<UserInfo>>(pagedUsers.Items);

            return new PagedResponse<UserInfo>(mappedUsers, pagedUsers.TotalCount);
        }

        public async Task<UserInfo?> GetUserByIdAsync(Guid userId)
        {
            if (userId == Guid.Empty)
            {
                return null;
            }

            var user = await _unitOfWork.UsersRepository.GetByUserIdAsync(userId);

            return user == null ? null : _mapper.Map<UserInfo>(user);
        }

        public async Task<UserProfile?> GetUserProfileById(Guid userId)
        {
            if (userId == Guid.Empty)
            {
                return null;
            }

            var user = await _unitOfWork.UsersRepository.GetByUserIdAsync(userId);

            return user == null ? null : _mapper.Map<UserProfile>(user);
        }

        public async Task<UserInfo> CreateUserAsync(UserRegisterRequest request)
        {
            await _userValidationService.ValidateLoginIdAvailabilityAsync(request.LoginId);

            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                await _userValidationService.ValidateEmailAvailabilityAsync(request.Email);
            }

            var userEntity = _mapper.Map<User>(request);
            userEntity.Password = _passwordHasher.HashPassword(userEntity, request.Password);
            userEntity.CreatedDate = DateTime.UtcNow;
            userEntity.CreatedBy = _currentUserService.UserId;
            userEntity.IsActive = true;

            await _userAssigmentService.AssignRoleToUserAsync(userEntity, request.RoleId);
            await _userAssigmentService.AssignFacultiesToUserAsync(userEntity, request.FacultyIds);

            await _unitOfWork.Repository<User>().AddAsync(userEntity);
            await _unitOfWork.SaveChangesAsync();

            if (userEntity.Role.Name == RoleNames.Guest)
            {
                var facultyCoordintors = await _unitOfWork.UsersRepository.GetUsersByFacultyIdAsync(userEntity.Faculties.Select(f => f.FacultyId).ToList(), RoleNames.Coordinator);

                foreach (var coordinator in facultyCoordintors)
                {
                    var body = _emailService.GenerateEmailBody("New Guest User Created", coordinator.FullName, "New guest user account is created under your faculty.");
                    await _emailService.SendEmailAsync(coordinator.Email, "New Guest User Created", body);
                }
            }

            _logger.LogInformation("User created: {UserId} - {LoginId}", userEntity.UserId, userEntity.LoginId);

            return _mapper.Map<UserInfo>(userEntity);
        }

        public async Task<UserInfo?> UpdateUserAsync(Guid userId, UserUpdateRequest request)
        {
            if (userId == Guid.Empty)
            {
                return null;
            }

            var user = await _unitOfWork.UsersRepository.GetByUserIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User not found for update: {UserId}", userId);
                return null;
            }

            if (!string.IsNullOrWhiteSpace(request.LoginId) &&
                !string.Equals(user.LoginId, request.LoginId, StringComparison.OrdinalIgnoreCase))
            {
                await _userValidationService.ValidateLoginIdAvailabilityAsync(request.LoginId, userId);

                user.LoginId = request.LoginId;
            }

            if (!string.IsNullOrWhiteSpace(request.FullName))
            {
                user.FullName = request.FullName;
            }

            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                if (!string.Equals(user.Email, request.Email, StringComparison.OrdinalIgnoreCase))
                {
                    await _userValidationService.ValidateEmailAvailabilityAsync(request.Email, userId);
                }

                user.Email = request.Email;
            }

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                user.Password = _passwordHasher.HashPassword(user, request.Password);
            }

            if (request.FacultyIds != null)
            {
                await _userAssigmentService.AssignFacultiesToUserAsync(user, request.FacultyIds);
            }

            if (request.RoleId != null)
            {
                await _userAssigmentService.AssignRoleToUserAsync(user, request.RoleId);
            }

            if (request.IsActive.HasValue)
            {
                user.IsActive = request.IsActive.Value;
            }

            user.ModifiedDate = DateTime.UtcNow;
            user.ModifiedBy = _currentUserService.UserId;

            _unitOfWork.Repository<User>().Update(user);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("User updated: {UserId}", user.UserId);

            return _mapper.Map<UserInfo>(user);
        }

        public async Task<bool> DeleteUserAsync(Guid userId)
        {
            if (userId == Guid.Empty)
            {
                return false;
            }

            var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User not found for deletion: {UserId}", userId);
                return false;
            }

            _unitOfWork.Repository<User>().Remove(user);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("User soft deleted (IsActive=false): {UserId}", user.UserId);
            return true;
        }

        public async Task<UserLoginResponse> LoginAsync(UserLoginRequest request)
        {
            var user = await _unitOfWork.UsersRepository.GetByLoginIdAsync(request.LoginId);
            if (user == null)
            {
                _logger.LogWarning("Login failed. User not found: {LoginId}", request.LoginId);
                throw new InvalidOperationException("Invalid login credentials");
            }

            if (!user.IsActive)
            {
                _logger.LogWarning("Login failed. Inactive user: {LoginId}", request.LoginId);
                throw new InvalidOperationException("User is inactive");
            }

            var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.Password, request.Password);
            if (verificationResult == PasswordVerificationResult.Failed)
            {
                _logger.LogWarning("Login failed. Invalid password for user: {LoginId}", request.LoginId);
                throw new InvalidOperationException("Invalid login credentials");
            }

            if (verificationResult == PasswordVerificationResult.SuccessRehashNeeded)
            {
                user.Password = _passwordHasher.HashPassword(user, request.Password);
            }

            user.LastLoginDate = DateTime.UtcNow;
            var refreshTokenInfo = _tokenService.GenerateRefreshToken();
            user.RefreshToken = refreshTokenInfo.Token;
            user.RefreshTokenExpiresAt = refreshTokenInfo.ExpireAt;

            _unitOfWork.Repository<User>().Update(user);
            await _unitOfWork.SaveChangesAsync();

            var accessTokenInfo = _tokenService.GenerateAccessToken(user);

            var isFirstTimeLogin = user.LastLoginDate == null ? true : false;

            return new UserLoginResponse
            {
                Token = accessTokenInfo.Token,
                ExpiresAt = accessTokenInfo.ExpireAt,
                RefreshToken = refreshTokenInfo.Token,
                FirstTimeLogin = isFirstTimeLogin,
            };
        }

        public async Task<RefreshTokenResponse> RefreshTokenAsync(RefreshTokenRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                throw new InvalidOperationException("Refresh token is required");
            }

            var refreshTokenValue = request.RefreshToken.Trim();
            var user = await _unitOfWork.UsersRepository.GetByRefreshTokenAsync(refreshTokenValue);
            if (user == null)
            {
                _logger.LogWarning("Refresh token failed. Token not found");
                throw new InvalidOperationException("Invalid refresh token");
            }

            if (!user.RefreshTokenExpiresAt.HasValue || user.RefreshTokenExpiresAt.Value <= DateTime.UtcNow)
            {
                _logger.LogWarning("Refresh token expired for user {UserId}", user.UserId);
                throw new InvalidOperationException("Refresh token has expired");
            }

            var refreshTokenInfo = _tokenService.GenerateRefreshToken();
            user.RefreshToken = refreshTokenInfo.Token;
            user.RefreshTokenExpiresAt = refreshTokenInfo.ExpireAt;
            user.ModifiedDate = DateTime.UtcNow;

            _unitOfWork.Repository<User>().Update(user);
            await _unitOfWork.SaveChangesAsync();

            var accessTokenInfo = _tokenService.GenerateAccessToken(user);

            return new RefreshTokenResponse
            {
                Token = accessTokenInfo.Token,
                ExpiresAt = accessTokenInfo.ExpireAt,
                RefreshToken = refreshTokenInfo.Token
            };
        }

        public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
        {
            var user = await _unitOfWork.UsersRepository.GetByUserIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            var verificationResult = _passwordHasher.VerifyHashedPassword(user, user.Password, request.CurrentPassword);
            if (verificationResult == PasswordVerificationResult.Failed)
            {
                throw new InvalidOperationException("Current password is incorrect");
            }

            user.Password = _passwordHasher.HashPassword(user, request.NewPassword);
            user.ModifiedDate = DateTime.UtcNow;
            user.ModifiedBy = _currentUserService.UserId;

            _unitOfWork.Repository<User>().Update(user);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Password changed for user: {UserId}", user.UserId);
        }
    }
}
