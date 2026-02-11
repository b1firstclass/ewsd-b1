using CMS.Application.Interfaces.Repositories;

namespace ewsd_backend.Application.Interfaces.Common
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<TEntity> Repository<TEntity>() where TEntity : class;
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
