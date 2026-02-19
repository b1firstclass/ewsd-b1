namespace CMS.Application.Interfaces.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        IUsersRepository UsersRepository { get; }
        IRolesRepository RolesRepository { get; }
        IFacultiesRepository FacultiesRepository { get; }
        IPermissionsRepository PermissionsRepository { get; }
        IContributionWindowsRepository ContributionWindowsRepository { get; }
        IRepository<TEntity> Repository<TEntity>() where TEntity : class;
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
