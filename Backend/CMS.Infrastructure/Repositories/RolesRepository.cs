using System.Collections.Generic;
using System.Threading.Tasks;
using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
using CMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CMS.Infrastructure.Repositories
{
    public class RolesRepository : Repository<Role>, IRolesRepository
    {
        private readonly AppDbContext _context;

        public RolesRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<Role>> GetAllWithPermissionsAsync()
        {
            return await _context.Roles
                .Include(r => r.Permissions)
                .ToListAsync();
        }

        public async Task<Role?> GetByIdWithPermissionsAsync(string roleId)
        {
            if (string.IsNullOrWhiteSpace(roleId))
            {
                return null;
            }

            return await _context.Roles
                .Include(r => r.Permissions)
                .FirstOrDefaultAsync(r => r.RoleId == roleId);
        }
    }
}
