using System;

namespace CMS.Application.Utilities
{
    public static class RoleValidator
    {
        public static void EnsureRoleNameAvailable(string roleName, bool exists)
        {
            if (exists)
            {
                throw new InvalidOperationException($"Role with name '{roleName}' already exists");
            }
        }
    }
}
