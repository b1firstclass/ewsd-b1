using CMS.Application.Common;
using CMS.Application.Interfaces.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;

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

                var rawFacultyClaims = principal.FindAll(PermissionClaimTypes.Faculty)
                    .Select(claim => claim.Value)
                    .ToList();

                var parsedFacultyIds = rawFacultyClaims
                    .SelectMany(claim => ParseGuidValues(claim))
                    .Distinct()
                    .ToList();

                return parsedFacultyIds;
            }
        }

        private static IEnumerable<Guid> ParseGuidValues(string? rawValue)
        {
            if (string.IsNullOrWhiteSpace(rawValue))
            {
                return [];
            }

            var trimmedValue = rawValue.Trim();

            if (Guid.TryParse(trimmedValue, out var singleGuid))
            {
                return [singleGuid];
            }

            if (trimmedValue.StartsWith("[", StringComparison.Ordinal))
            {
                try
                {
                    using var jsonDoc = JsonDocument.Parse(trimmedValue);
                    if (jsonDoc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        return jsonDoc.RootElement.EnumerateArray()
                            .Where(element => element.ValueKind == JsonValueKind.String)
                            .Select(element => element.GetString())
                            .Where(value => !string.IsNullOrWhiteSpace(value))
                            .Select(value => Guid.TryParse(value, out var parsed) ? (Guid?)parsed : null)
                            .Where(parsed => parsed.HasValue)
                            .Select(parsed => parsed!.Value)
                            .ToList();
                    }
                }
                catch (JsonException)
                {
                }
            }

            return trimmedValue.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(value => Guid.TryParse(value, out var parsed) ? (Guid?)parsed : null)
                .Where(parsed => parsed.HasValue)
                .Select(parsed => parsed!.Value)
                .ToList();
        }
    }
}
