using CMS.Application.Interfaces.Repositories;
using CMS.Infrastructure.Persistence;

namespace CMS.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private readonly Dictionary<Type, object> _repositories;
        private readonly IUsersRepository _usersRepository;
        private readonly IRolesRepository _rolesRepository;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
            _repositories = new Dictionary<Type, object>();
        }

        public IUsersRepository UsersRepository
        {
            get
            {
                if (_usersRepository == null)
                {
                    return new UsersRepository(_context);
                }
                return _usersRepository;
            }
        }

        public IRolesRepository RolesRepository
        {
            get
            {
                if (_rolesRepository == null)
                {
                    return new RolesRepository(_context);
                }
                return _rolesRepository;
            }
        }

        public IRepository<T> Repository<T>() where T : class
        {
            var type = typeof(T);

            if (!_repositories.ContainsKey(type))
            {
                var repositoryInstance = new Repository<T>(_context);
                _repositories[type] = repositoryInstance;
            }

            return (IRepository<T>)_repositories[type];
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
