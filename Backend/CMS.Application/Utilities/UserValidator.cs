using System;

namespace CMS.Application.Utilities
{
    public static class UserValidator
    {
        public static void EnsureLoginIdAvailable(string loginId, bool exists)
        {
            if (exists)
            {
                throw new InvalidOperationException($"LoginId '{loginId}' already exists");
            }
        }

        public static void EnsureEmailAvailable(string email, bool exists)
        {
            if (exists)
            {
                throw new InvalidOperationException($"Email '{email}' already exists");
            }
        }
    }
}
