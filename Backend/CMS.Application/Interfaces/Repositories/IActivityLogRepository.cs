using System.Threading.Tasks;
using CMS.Domain.Entities;

namespace CMS.Application.Interfaces.Repositories
{
    public interface IActivityLogRepository
    {
        Task AddAsync(UserActivityLog log);
    }
}
