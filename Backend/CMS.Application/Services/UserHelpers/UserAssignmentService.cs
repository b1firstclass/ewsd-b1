using CMS.Application.Interfaces.Repositories;
using CMS.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace CMS.Application.Services.UserHelpers
{
    public interface IUserAssignmentService
    {
        Task AssignFacultiesToUserAsync(User user, IEnumerable<Guid>? facultyIds);
        Task AssignRolesToUserAsync(User user, IEnumerable<Guid>? roleIds);
    }

    public class UserAssignmentService : IUserAssignmentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<UserAssignmentService> _logger;

        public UserAssignmentService(IUnitOfWork unitOfWork, ILogger<UserAssignmentService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task AssignFacultiesToUserAsync(User user, IEnumerable<Guid>? facultyIds)
        {
            user.Faculties ??= new List<Faculty>();
            user.Faculties.Clear();

            if (facultyIds == null)
            {
                return;
            }

            var validFacultyIds = facultyIds.Where(id => id != Guid.Empty).Distinct();

            foreach (var facultyId in validFacultyIds)
            {
                var faculty = await _unitOfWork.Repository<Faculty>().GetByIdAsync(facultyId);
                if (faculty != null && faculty.IsActive)
                {
                    user.Faculties.Add(faculty);
                }
                else
                {
                    _logger.LogWarning("Faculty not found or inactive while assigning to user {UserId}: {FacultyId}",
                        user.UserId, facultyId);
                }
            }
        }

        public async Task AssignRolesToUserAsync(User user, IEnumerable<Guid>? roleIds)
        {
            user.Roles ??= new List<Role>();
            user.Roles.Clear();

            if (roleIds == null)
            {
                return;
            }

            var validRoleIds = roleIds.Where(id => id != Guid.Empty).Distinct();

            foreach (var roleId in validRoleIds)
            {
                var role = await _unitOfWork.Repository<Role>().GetByIdAsync(roleId);
                if (role != null && role.IsActive)
                {
                    user.Roles.Add(role);
                }
                else
                {
                    _logger.LogWarning("Role not found or inactive while assigning to user {UserId}: {RoleId}",
                        user.UserId, roleId);
                }
            }
        }
    }
}
