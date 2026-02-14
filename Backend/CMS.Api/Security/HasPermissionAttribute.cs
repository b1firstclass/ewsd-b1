using CMS.Application.Common;
using Microsoft.AspNetCore.Authorization;

namespace CMS.Api.Security
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true, Inherited = true)]
    public sealed class HasPermissionAttribute : AuthorizeAttribute
    {
        public HasPermissionAttribute(string permission)
        {
            if (string.IsNullOrWhiteSpace(permission))
            {
                throw new ArgumentException("Permission cannot be null or empty", nameof(permission));
            }

            Policy = PermissionPolicies.Build(permission);
        }
    }
}
