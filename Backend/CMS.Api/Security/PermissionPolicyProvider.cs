using CMS.Application.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace CMS.Api.Security
{
    public sealed class PermissionPolicyProvider : DefaultAuthorizationPolicyProvider
    {
        public PermissionPolicyProvider(IOptions<AuthorizationOptions> options)
            : base(options)
        {
        }

        public override Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
        {
            if (policyName.StartsWith(PermissionPolicies.Prefix, StringComparison.OrdinalIgnoreCase))
            {
                var permission = policyName[PermissionPolicies.Prefix.Length..];
                if (string.IsNullOrWhiteSpace(permission))
                {
                    return base.GetPolicyAsync(policyName);
                }

                var policy = new AuthorizationPolicyBuilder()
                    .AddRequirements(new PermissionRequirement(permission))
                    .Build();

                return Task.FromResult<AuthorizationPolicy?>(policy);
            }

            return base.GetPolicyAsync(policyName);
        }
    }
}
