namespace CMS.Application.Interfaces.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        IUsersRepository UsersRepository { get; }
        IRolesRepository RolesRepository { get; }
        IRepository<TEntity> Repository<TEntity>() where TEntity : class;
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
