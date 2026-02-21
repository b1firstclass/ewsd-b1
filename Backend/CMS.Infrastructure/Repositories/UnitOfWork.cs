using CMS.Application.Interfaces.Repositories;
using CMS.Infrastructure.Persistence;

namespace CMS.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private readonly Dictionary<Type, object> _repositories;
        private IUsersRepository? _usersRepository;
        private IRolesRepository? _rolesRepository;
        private IFacultiesRepository? _facultiesRepository;
        private IPermissionsRepository? _permissionsRepository;
        private IContributionWindowsRepository? _contributionWindowsRepository;
        private IContributionsRepository? _contributionsRepository;
        private ICommentsRepository? _commentsRepository;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
            _repositories = new Dictionary<Type, object>();
        }

        public IUsersRepository UsersRepository
        {
            get
            {
                return _usersRepository ??= new UsersRepository(_context);
            }
        }

        public IRolesRepository RolesRepository
        {
            get
            {
                return _rolesRepository ??= new RolesRepository(_context);
            }
        }

        public IFacultiesRepository FacultiesRepository
        {
            get
            {
                return _facultiesRepository ??= new FacultiesRepository(_context);
            }
        }

        public IPermissionsRepository PermissionsRepository
        {
            get
            {
                return _permissionsRepository ??= new PermissionsRepository(_context);
            }
        }

        public IContributionWindowsRepository ContributionWindowsRepository
        {
            get
            {
                return _contributionWindowsRepository ??= new ContributionWindowsRepository(_context);
            }
        }

        public IContributionsRepository ContributionsRepository
        {
            get
            {
                return _contributionsRepository ??= new ContributionsRepository(_context);
            }
        }

        public ICommentsRepository CommentsRepository
        {
            get
            {
                return _commentsRepository ??= new CommentsRepository(_context);
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
