using CMS.Application.Interfaces.Repositories;
using CMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace CMS.Infrastructure.Repositories
{
    public class Repository<TEntity> : IRepository<TEntity> where TEntity : class
    {
        protected readonly AppDbContext context;
        public Repository(AppDbContext context)
        {
            this.context = context;
        }

        public virtual async Task<TEntity?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
            {
                return null;
            }

            var entity = await context.Set<TEntity>().FindAsync(id);
            if (entity == null)
            {
                return null;
            }

            //var isActiveProperty = typeof(TEntity).GetProperty("IsActive");
            //if (isActiveProperty != null && isActiveProperty.PropertyType == typeof(bool))
            //{
            //    var isActiveValue = (bool)(isActiveProperty.GetValue(entity) ?? false);
            //    if (!isActiveValue)
            //    {
            //        context.Entry(entity).State = EntityState.Detached;
            //        return null;
            //    }
            //}

            return entity;
        }

        public async Task<IReadOnlyList<TEntity>> GetAllAsync()
        {
            return await context.Set<TEntity>().ToListAsync();
        }

        public async Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate)
        {
            return await context.Set<TEntity>().AnyAsync(predicate);
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
