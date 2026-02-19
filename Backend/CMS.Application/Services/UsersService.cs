using System;
using System.Collections.Generic;
using System.Linq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using CMS.Application.Common;
using CMS.Application.DTOs;
using CMS.Application.Interfaces.Repositories;
using CMS.Application.Interfaces.Services;
using CMS.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace CMS.Application.Services
{
    public class UsersService : IUsersService
    {
        private const string FacultyIdsClaim = "cms:faculty_ids";
        private const string FacultyNamesClaim = "cms:faculty_names";
        private const string RoleIdsClaim = "cms:role_ids";
        private const string PermissionClaim = PermissionClaimTypes.Permission;

        private readonly ILogger<UsersService> _logger;
        private readonly IMapper _mapper;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly AppSettings _appSettings;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        public UsersService(ILogger<UsersService> logger, IMapper mapper, IPasswordHasher<User> passwordHasher,
            IOptions<AppSettings> appSettings, IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
        {
            _logger = logger;
            _mapper = mapper;
            _passwordHasher = passwordHasher;
            _appSettings = appSettings.Value;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<PagedResponse<UserInfo>> GetAllUsersAsync(PaginationRequest paginationRequest)
        {
            var skip = paginationRequest.GetSkipCount();
            var take = paginationRequest.PageSize;

            var pagedUsers = await _unitOfWork.UsersRepository.GetPagedAsync(skip, take, paginationRequest.SearchKeyword);

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

        public async Task<UserInfo> CreateUserAsync(UserRegisterRequest request)
        {
            if (await LoginIdExistsAsync(request.LoginId))
            {
                throw new InvalidOperationException($"LoginId '{request.LoginId}' already exists");
            }

            if (!string.IsNullOrWhiteSpace(request.Email) && await EmailExistsAsync(request.Email))
            {
                throw new InvalidOperationException($"Email '{request.Email}' already exists");
            }

            var userEntity = _mapper.Map<User>(request);
            userEntity.Password = _passwordHasher.HashPassword(userEntity, request.Password);
            userEntity.CreatedDate = DateTime.UtcNow;
            userEntity.CreatedBy = _currentUserService.UserId;
            userEntity.IsActive = true;
            await AssignFacultiesAsync(userEntity, request.FacultyIds);
            await AssignRolesAsync(userEntity, request.RoleIds);

            await _unitOfWork.Repository<User>().AddAsync(userEntity);
            await _unitOfWork.SaveChangesAsync();

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
                if (await LoginIdExistsAsync(request.LoginId, userId))
                {
                    throw new InvalidOperationException($"LoginId '{request.LoginId}' already exists");
                }

                user.LoginId = request.LoginId;
            }

            if (!string.IsNullOrWhiteSpace(request.FullName))
            {
                user.FullName = request.FullName;
            }

            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                if (!string.Equals(user.Email, request.Email, StringComparison.OrdinalIgnoreCase) &&
                    await EmailExistsAsync(request.Email, userId))
                {
                    throw new InvalidOperationException($"Email '{request.Email}' already exists");
                }

                user.Email = request.Email;
            }

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                user.Password = _passwordHasher.HashPassword(user, request.Password);
            }

            if (request.FacultyIds != null)
            {
                await AssignFacultiesAsync(user, request.FacultyIds);
            }

            if (request.RoleIds != null)
            {
                await AssignRolesAsync(user, request.RoleIds);
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

            user.IsActive = false;
            user.ModifiedDate = DateTime.UtcNow;
            user.ModifiedBy = _currentUserService.UserId;
            _unitOfWork.Repository<User>().Update(user);
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
            var (refreshToken, refreshExpiresAt) = GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiresAt = refreshExpiresAt;

            _unitOfWork.Repository<User>().Update(user);
            await _unitOfWork.SaveChangesAsync();

            var (token, expiresAt) = GenerateJwtToken(user);

            return new UserLoginResponse
            {
                Token = token,
                ExpiresAt = expiresAt,
                RefreshToken = refreshToken,
                User = _mapper.Map<UserInfo>(user)
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

            var (newRefreshToken, refreshExpiresAt) = GenerateRefreshToken();
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiresAt = refreshExpiresAt;
            user.ModifiedDate = DateTime.UtcNow;

            _unitOfWork.Repository<User>().Update(user);
            await _unitOfWork.SaveChangesAsync();

            var (token, expiresAt) = GenerateJwtToken(user);

            return new RefreshTokenResponse
            {
                Token = token,
                ExpiresAt = expiresAt,
                RefreshToken = newRefreshToken
            };
        }

        private async Task<bool> LoginIdExistsAsync(string loginId, Guid? excludeUserId = null)
        {
            if (string.IsNullOrWhiteSpace(loginId))
            {
                return false;
            }

            var existingUser = await _unitOfWork.UsersRepository.GetByLoginIdAsync(loginId);
            if (existingUser == null)
            {
                return false;
            }

            return !excludeUserId.HasValue || existingUser.UserId != excludeUserId.Value;
        }

        private async Task<bool> EmailExistsAsync(string email, Guid? excludeUserId = null)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return false;
            }

            var existingUser = await _unitOfWork.UsersRepository.GetByEmailAsync(email);
            if (existingUser == null)
            {
                return false;
            }

            return !excludeUserId.HasValue || existingUser.UserId != excludeUserId.Value;
        }

        private async Task AssignFacultiesAsync(User user, IEnumerable<Guid>? facultyIds)
        {
            if (user.Faculties == null)
            {
                user.Faculties = new List<Faculty>();
            }

            user.Faculties.Clear();

            if (facultyIds == null)
            {
                return;
            }

            foreach (var facultyId in facultyIds.Where(id => id != Guid.Empty).Distinct())
            {
                var faculty = await _unitOfWork.Repository<Faculty>().GetByIdAsync(facultyId);
                if (faculty != null)
                {
                    user.Faculties.Add(faculty);
                }
                else
                {
                    _logger.LogWarning("Faculty not found while assigning to user {UserId}: {FacultyId}", user.UserId, facultyId);
                }
            }
        }

        private async Task AssignRolesAsync(User user, IEnumerable<Guid>? roleIds)
        {
            if (user.Roles == null)
            {
                user.Roles = new List<Role>();
            }

            user.Roles.Clear();

            if (roleIds == null)
            {
                return;
            }

            foreach (var roleId in roleIds.Where(id => id != Guid.Empty).Distinct())
            {
                var role = await _unitOfWork.Repository<Role>().GetByIdAsync(roleId);
                if (role != null)
                {
                    user.Roles.Add(role);
                }
                else
                {
                    _logger.LogWarning("Role not found while assigning to user {UserId}: {RoleId}", user.UserId, roleId);
                }
            }
        }

        private (string Token, DateTime ExpiresAt) GenerateRefreshToken()
        {
            var randomBytes = RandomNumberGenerator.GetBytes(64);
            var token = Convert.ToBase64String(randomBytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');

            var expiresAt = DateTime.UtcNow.AddMinutes(_appSettings.JwtSettings.RefreshExpiryMinutes);
            return (token, expiresAt);
        }

        private (string Token, DateTime ExpiresAt) GenerateJwtToken(User user)
        {
            var jwtSettings = _appSettings.JwtSettings;
            var expiresAt = DateTime.UtcNow.AddMinutes(jwtSettings.ExpiryMinutes);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.LoginId),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            if (!string.IsNullOrWhiteSpace(user.Email))
            {
                claims.Add(new Claim(JwtRegisteredClaimNames.Email, user.Email));
            }

            AppendFacultyClaims(user, claims);
            AppendRoleClaims(user, claims);
            AppendPermissionClaims(user, claims);

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtSettings.Issuer,
                audience: jwtSettings.Audience,
                claims: claims,
                expires: expiresAt,
                signingCredentials: creds);

            var tokenHandler = new JwtSecurityTokenHandler();
            return (tokenHandler.WriteToken(token), token.ValidTo);
        }

        private void AppendFacultyClaims(User user, ICollection<Claim> claims)
        {
            if (user.Faculties == null || user.Faculties.Count == 0)
            {
                return;
            }

            var facultyIds = user.Faculties
                .Select(f => f.FacultyId)
                .Where(id => id != Guid.Empty)
                .Distinct()
                .ToList();

            var facultyNames = user.Faculties
                .Select(f => f.FacultyName)
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            foreach (var facultyId in facultyIds)
            {
                claims.Add(new Claim(FacultyIdsClaim, facultyId.ToString()));
            }

            foreach (var facultyName in facultyNames)
            {
                claims.Add(new Claim(FacultyNamesClaim, facultyName));
            }
        }

        private void AppendRoleClaims(User user, ICollection<Claim> claims)
        {
            if (user.Roles == null || user.Roles.Count == 0)
            {
                return;
            }

            var roleIds = user.Roles
                .Select(r => r.RoleId)
                .Where(id => id != Guid.Empty)
                .Distinct()
                .ToList();

            var roleNames = user.Roles
                .Select(r => r.Name)
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            foreach (var roleName in roleNames)
            {
                claims.Add(new Claim(ClaimTypes.Role, roleName));
            }

            foreach (var roleId in roleIds)
            {
                claims.Add(new Claim(RoleIdsClaim, roleId.ToString()));
            }
        }

        private void AppendPermissionClaims(User user, ICollection<Claim> claims)
        {
            if (user.Roles == null || user.Roles.Count == 0)
            {
                return;
            }

            var permissionNames = user.Roles
                .Where(r => r.Permissions != null && r.Permissions.Count > 0)
                .SelectMany(r => r.Permissions)
                .Where(p => p.IsActive && !string.IsNullOrWhiteSpace(p.Name))
                .Select(p => p.Name.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            foreach (var permission in permissionNames)
            {
                claims.Add(new Claim(PermissionClaim, permission));
            }
        }
    }
}
