using CMS.Application.Common;
using CMS.Domain.Entities;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace CMS.Application.Services.TokenHelpers
{
    public interface ITokenService
    {
        (string Token, DateTime ExpiresAt) GenerateAccessToken(User user);
        (string RefreshToken, DateTime ExpiresAt) GenerateRefreshToken();
    }

    public class TokenService : ITokenService
    {
        private const string FacultyIdsClaim = "cms:faculty_ids";
        private const string FacultyNamesClaim = "cms:faculty_names";
        private const string RoleIdsClaim = "cms:role_ids";
        private const string PermissionClaim = PermissionClaimTypes.Permission;

        private readonly JwtSettings _jwtSettings;

        public TokenService(JwtSettings jwtSettings)
        {
            _jwtSettings = jwtSettings;
        }

        public (string Token, DateTime ExpiresAt) GenerateAccessToken(User user)
        {
            var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes);
            var claims = BuildClaims(user);
            var token = CreateJwtSecurityToken(claims, expiresAt);
            var tokenHandler = new JwtSecurityTokenHandler();

            return (tokenHandler.WriteToken(token), token.ValidTo);
        }

        public (string RefreshToken, DateTime ExpiresAt) GenerateRefreshToken()
        {
            var randomBytes = RandomNumberGenerator.GetBytes(64);
            var token = Convert.ToBase64String(randomBytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');

            var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.RefreshExpiryMinutes);
            return (token, expiresAt);
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
            if (user.Roles == null || user.Roles.Count == 0)
            {
                return;
            }

            var roleIds = user.Roles
                .Select(r => r.RoleId)
                .Where(id => id != Guid.Empty)
                .Distinct();

            var roleNames = user.Roles
                .Select(r => r.Name)
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .Distinct(StringComparer.OrdinalIgnoreCase);

            foreach (var roleName in roleNames)
            {
                claims.Add(new Claim(ClaimTypes.Role, roleName));
            }

            foreach (var roleId in roleIds)
            {
                claims.Add(new Claim(RoleIdsClaim, roleId.ToString()));
            }
        }

        private static void AddPermissionClaims(User user, ICollection<Claim> claims)
        {
            if (user.Roles == null || user.Roles.Count == 0)
            {
                return;
            }

            var permissionNames = user.Roles
                .Where(r => r.Permissions != null && r.Permissions.Count > 0)
                .SelectMany(r => r.Permissions)
                .Where(p => p.IsActive && !string.IsNullOrWhiteSpace(p.Name))
                .Select(p => p.Name.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase);

            foreach (var permission in permissionNames)
            {
                claims.Add(new Claim(PermissionClaim, permission));
            }
        }
    }
}
