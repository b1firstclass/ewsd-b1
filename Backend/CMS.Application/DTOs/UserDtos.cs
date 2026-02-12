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
        [Required(ErrorMessage = "Faculty Id is required")]
        public required string FacultyId { get; set; }
        public string? RoleId { get; set; }
    }
    #endregion

    #region response
    #endregion
}
