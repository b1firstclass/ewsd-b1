using CMS.Application.Common;
using Microsoft.AspNetCore.Authorization;

namespace CMS.Api.Security
{
    public sealed class PermissionRequirement : IAuthorizationRequirement
    {
        public PermissionRequirement(string permission)
        {
            Permission = permission ?? throw new ArgumentNullException(nameof(permission));
        }

        public string Permission { get; }
    }

    public sealed class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
        {
            if (string.IsNullOrWhiteSpace(requirement.Permission))
            {
                return Task.CompletedTask;
            }

            var hasPermission = context.User
                .FindAll(PermissionClaimTypes.Permission)
                .Any(claim => string.Equals(claim.Value, requirement.Permission, StringComparison.OrdinalIgnoreCase));

            if (hasPermission)
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }
    }
}
