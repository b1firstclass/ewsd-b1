using CMS.Domain.Entities;

namespace CMS.Application.Interfaces.Services
{
    public interface IUserAssignmentService
    {
        Task AssignFacultiesToUserAsync(User user, IEnumerable<Guid>? facultyIds);
        Task AssignRoleToUserAsync(User user, Guid? roleIds);
    }
}
