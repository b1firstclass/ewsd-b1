using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
using CMS.Infrastructure.Persistence;

namespace CMS.Infrastructure.Repositories
{
    public class ActivityLogRepository : IActivityLogRepository
    {
        private readonly AppDbContext _dbContext;

        public ActivityLogRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task AddAsync(UserActivityLog log)
        {
            await _dbContext.UserActivityLogs.AddAsync(log);
            await _dbContext.SaveChangesAsync();
        }
    }
}
