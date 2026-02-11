using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
using CMS.Infrastructure.Persistence;

namespace CMS.Infrastructure.Repositories
{
    public class FacultiesRepository : Repository<Faculty>, IFacultiesRepository
    {
        private readonly AppDbContext _context;
        public FacultiesRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }
    }
}
