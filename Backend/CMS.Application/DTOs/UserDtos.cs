using CMS.Application.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace CMS.Application.DTOs
{
    #region request
    public class UserRegisterRequest
    {
        [Required(ErrorMessage = "LoginId is required")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "LoginId must be between 3 and 100 characters")]
        public required string LoginId { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [PasswordValidation]
        public required string Password { get; set; }

        [Required(ErrorMessage = "FullName is required")]
        [StringLength(200)]
        public required string FullName { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public required string Email { get; set; }
        public List<Guid>? FacultyIds { get; set; }
        public List<Guid>? RoleIds { get; set; }
    }

    public class UserUpdateRequest
    {
        [StringLength(100, MinimumLength = 3, ErrorMessage = "LoginId must be between 3 and 100 characters")]
        public string? LoginId { get; set; }

        [PasswordValidation(AllowNull = true)]
        public string? Password { get; set; }

        [StringLength(200)]
        public string? FullName { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string? Email { get; set; }

        public List<Guid>? FacultyIds { get; set; }
        public List<Guid>? RoleIds { get; set; }
    }

    public class UserLoginRequest
    {
        [Required(ErrorMessage = "LoginId is required")]
        public required string LoginId { get; set; }

        [Required(ErrorMessage = "Password is required")]
        public required string Password { get; set; }
    }
    #endregion

    #region response
    public class UserInfo
    {
        public Guid Id { get; set; }
        public required string LoginId { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public List<FaculityInfo> Faculties { get; set; } = new();
        public List<RoleInfo> Roles { get; set; } = new();
    }

    public class UserLoginResponse
    {
        public required string Token { get; set; }
        public DateTime ExpiresAt { get; set; }
        public required string RefreshToken { get; set; }
    }

    public class RefreshTokenRequest
    {
        [Required(ErrorMessage = "Refresh token is required")]
        public required string RefreshToken { get; set; }
    }

    public class RefreshTokenResponse
    {
        public required string Token { get; set; }
        public DateTime ExpiresAt { get; set; }
        public required string RefreshToken { get; set; }
    }
    #endregion
}
