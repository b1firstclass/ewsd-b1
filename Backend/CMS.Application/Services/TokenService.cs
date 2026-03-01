using CMS.Application.Common;
using CMS.Application.Interfaces.Services;
using CMS.Domain.Entities;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace CMS.Application.Services
{
    public class TokenService : ITokenService
    {
        private const string FacultyIdsClaim = PermissionClaimTypes.Faculty;
        private const string FacultyNamesClaim = PermissionClaimTypes.FacultyName;
        private const string RoleIdsClaim = PermissionClaimTypes.Role;
        private const string PermissionClaim = PermissionClaimTypes.Permission;

        private readonly JwtSettings _jwtSettings;

        public TokenService(JwtSettings jwtSettings)
        {
            _jwtSettings = jwtSettings;
        }

        public TokenInfo GenerateAccessToken(User user)
        {
            var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes);
            var claims = BuildClaims(user);
            var token = CreateJwtSecurityToken(claims, expiresAt);
            var tokenHandler = new JwtSecurityTokenHandler();

            var tokenInfo = new TokenInfo
            {
                Token = tokenHandler.WriteToken(token),
                ExpireAt = token.ValidTo,
            };

            return tokenInfo;
        }

        public TokenInfo GenerateRefreshToken()
        {
            var randomBytes = RandomNumberGenerator.GetBytes(64);
            var token = Convert.ToBase64String(randomBytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');

            var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.RefreshExpiryMinutes);

            var refreshTokenInfo = new TokenInfo
            {
                Token = token,
                ExpireAt = expiresAt
            };

            return refreshTokenInfo;
        }

        private JwtSecurityToken CreateJwtSecurityToken(List<Claim> claims, DateTime expiresAt)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            return new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: expiresAt,
                signingCredentials: credentials);
        }

        private static List<Claim> BuildClaims(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.LoginId),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            if (!string.IsNullOrWhiteSpace(user.Email))
            {
                claims.Add(new Claim(JwtRegisteredClaimNames.Email, user.Email));
            }

            AddFacultyClaims(user, claims);
            AddRoleClaims(user, claims);
            AddPermissionClaims(user, claims);

            return claims;
        }

        private static void AddFacultyClaims(User user, ICollection<Claim> claims)
        {
            if (user.Faculties == null || user.Faculties.Count == 0)
            {
                return;
            }

            var facultyIds = user.Faculties
                .Select(f => f.FacultyId)
                .Where(id => id != Guid.Empty)
                .Distinct();

            var facultyNames = user.Faculties
                .Select(f => f.FacultyName)
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .Distinct(StringComparer.OrdinalIgnoreCase);

            foreach (var facultyId in facultyIds)
            {
                claims.Add(new Claim(FacultyIdsClaim, facultyId.ToString()));
            }

            foreach (var facultyName in facultyNames)
            {
                claims.Add(new Claim(FacultyNamesClaim, facultyName));
            }
        }

        private static void AddRoleClaims(User user, ICollection<Claim> claims)
        {
            if (user.Role == null)
            {
                return;
            }

            var roleId = user.Role.RoleId;
            var roleName = user.Role.Name;

            claims.Add(new Claim(ClaimTypes.Role, roleName));
            claims.Add(new Claim(RoleIdsClaim, roleId.ToString()));
        }

        private static void AddPermissionClaims(User user, ICollection<Claim> claims)
        {
            if (user.Role == null)
            {
                return;
            }

            var permissionNames = user.Role.Permissions != null && user.Role.Permissions.Count > 0
                ? user.Role.Permissions
                    .Where(p => p.IsActive && !string.IsNullOrWhiteSpace(p.Name))
                    .Select(p => p.Name.Trim())
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                : Enumerable.Empty<string>();

            foreach (var permission in permissionNames)
            {
                claims.Add(new Claim(PermissionClaim, permission));
            }
        }
    }
}
