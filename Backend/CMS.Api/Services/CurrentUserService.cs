using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Http;

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
    }
}
