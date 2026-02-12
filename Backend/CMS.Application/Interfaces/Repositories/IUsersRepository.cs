using CMS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace CMS.Application.Interfaces.Repositories
{
    public interface IUsersRepository : IRepository<User>
    {
        bool IsLoginIdExists(string loginId);
    }
}
