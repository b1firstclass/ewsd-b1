using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace CMS.Application.Utilities
{
    public class PasswordValidationAttribute : ValidationAttribute
    {
        private const int MinimumLength = 8;
        private const string UppercasePattern = @"[A-Z]";
        private const string LowercasePattern = @"[a-z]";
        private const string DigitPattern = @"[0-9]";
        private const string SpecialCharPattern = @"[@$!%*?&#^()_+\-=\[\]{}|;:,.<>]";

        public PasswordValidationAttribute()
        {
            ErrorMessage = "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&#^()_+-=[]{}|;:,.<>)";
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
            {
                return new ValidationResult("Password is required");
            }

            var password = value.ToString()!;

            if (password.Length < MinimumLength)
            {
                return new ValidationResult($"Password must be at least {MinimumLength} characters long");
            }

            if (!Regex.IsMatch(password, UppercasePattern))
            {
                return new ValidationResult("Password must contain at least one uppercase letter (A-Z)");
            }

            if (!Regex.IsMatch(password, LowercasePattern))
            {
                return new ValidationResult("Password must contain at least one lowercase letter (a-z)");
            }

            if (!Regex.IsMatch(password, DigitPattern))
            {
                return new ValidationResult("Password must contain at least one digit (0-9)");
            }

            if (!Regex.IsMatch(password, SpecialCharPattern))
            {
                return new ValidationResult("Password must contain at least one special character (@$!%*?&#^()_+-=[]{}|;:,.<>)");
            }

            return ValidationResult.Success;
        }
    }
}
