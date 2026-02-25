using CMS.Application.Common;
using CMS.Domain.Entities;

namespace CMS.Application.Interfaces.Services
{
    public interface ITokenService
    {
        TokenInfo GenerateAccessToken(User user);
        TokenInfo GenerateRefreshToken();
    }
}
