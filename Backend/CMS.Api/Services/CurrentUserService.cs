using CMS.Application.Common;
using CMS.Application.Interfaces.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace CMS.Api.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid? UserId
        {
            get
            {
                var principal = _httpContextAccessor.HttpContext?.User;
                if (principal?.Identity?.IsAuthenticated != true)
                {
                    return null;
                }

                var idString = principal.FindFirstValue(JwtRegisteredClaimNames.Sub) ??
                               principal.FindFirstValue(ClaimTypes.NameIdentifier);

                if (Guid.TryParse(idString, out var guid))
                {
                    return guid;
                }

                return null;
            }
        }

        public string? UserName
        {
            get
            {
                var principal = _httpContextAccessor.HttpContext?.User;
                if (principal?.Identity?.IsAuthenticated != true)
                {
                    return null;
                }
                return principal.Identity.Name;
            }
        }

        public IReadOnlyList<Guid> FacultyIds
        {
            get
            {
                var principal = _httpContextAccessor.HttpContext?.User;
                if (principal?.Identity?.IsAuthenticated != true)
                {
                    return [];
                }

                return principal.FindAll(PermissionClaimTypes.Faculty)
                    .Select(c => Guid.TryParse(c.Value, out var id) ? id : (Guid?)null)
                    .Where(id => id.HasValue)
                    .Select(id => id!.Value)
                    .ToList();
            }
        }
    }
}
