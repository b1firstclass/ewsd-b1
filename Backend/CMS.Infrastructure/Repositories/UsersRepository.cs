using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
using CMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Text;

namespace CMS.Infrastructure.Repositories
{
    public class UsersRepository : Repository<User>, IUsersRepository
    {
        private readonly AppDbContext _context;
        public UsersRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public bool IsLoginIdExists(string loginId)
        {
            var user = _context.Users.FirstOrDefault(u => u.LoginId == loginId);
            return user != null;
        }
    }
}
