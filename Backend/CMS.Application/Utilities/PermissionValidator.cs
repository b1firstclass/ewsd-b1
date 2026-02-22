using System;

namespace CMS.Application.Utilities
{
    public static class PermissionValidator
    {
        public static void EnsurePermissionAvailable(string module, string name, bool exists)
        {
            if (exists)
            {
                throw new InvalidOperationException($"Permission '{module}:{name}' already exists");
            }
        }

        public static void EnsurePermissionNameAvailable(string name, bool exists)
        {
            if (exists)
            {
                throw new InvalidOperationException($"Permission '{name}' already exists");
            }
        }
    }
}
