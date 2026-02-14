using CMS.Application.Interfaces.Repositories;
using CMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CMS.Infrastructure.Repositories
{
    public class Repository<TEntity> : IRepository<TEntity> where TEntity : class
    {
        protected readonly AppDbContext context;
        public Repository(AppDbContext context)
        {
            this.context = context;
        }

        public async Task<TEntity?> GetByIdAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return null;
            }

            return await context.Set<TEntity>().FindAsync(id);
        }

        public async Task<IReadOnlyList<TEntity>> GetAllAsync()
        {
            return await context.Set<TEntity>().ToListAsync();
        }

        public async Task AddAsync(TEntity entity)
        {
            await context.Set<TEntity>().AddAsync(entity);
        }

        public void Update(TEntity entity)
        {
            context.Set<TEntity>().Update(entity);
        }

        public void Remove(TEntity entity)
        {
            context.Set<TEntity>().Remove(entity);
        }
    }
}
