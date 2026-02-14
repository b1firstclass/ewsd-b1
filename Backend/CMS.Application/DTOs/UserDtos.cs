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

        [StringLength(100)]
        public string? FirstName { get; set; }

        [StringLength(100)]
        public string? LastName { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string? Email { get; set; }
        public List<string>? FacultyIds { get; set; }
        public List<string>? RoleId { get; set; }
    }

    public class UserUpdateRequest
    {
        [StringLength(100, MinimumLength = 3, ErrorMessage = "LoginId must be between 3 and 100 characters")]
        public string? LoginId { get; set; }

        [StringLength(100)]
        public string? FirstName { get; set; }

        [StringLength(100)]
        public string? LastName { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string? Email { get; set; }

        public List<string>? FacultyIds { get; set; }
        public List<string>? RoleId { get; set; }

        public bool? IsActive { get; set; }

        public string? Password { get; set; }
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
        public required string Id { get; set; }
        public required string LoginId { get; set; }
        public string? Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
    }

    public class UserLoginResponse
    {
        public required string Token { get; set; }
        public DateTime ExpiresAt { get; set; }
        public required UserInfo User { get; set; }
    }
    #endregion
}
