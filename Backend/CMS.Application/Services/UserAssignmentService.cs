using CMS.Application.Common;
using CMS.Application.Interfaces.Repositories;
using CMS.Application.Interfaces.Services;
using CMS.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace CMS.Application.Services
{

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

            if (validFacultyIds.Count() > 0 && user.Role.Name == RoleNames.Admin)
            {
                throw new InvalidOperationException($"Admin users cannot be assigned to specific faculties.");
            }

            if (validFacultyIds.Count() > 1 && user.Role.Name == RoleNames.Manager)
            {
                throw new InvalidOperationException($"Only manager users can be assigned to more than one faculty.");
            }

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

        public async Task AssignRoleToUserAsync(User user, Guid? roleId)
        {
            if (roleId is null)
            {
                return;
            }

            var role = await _unitOfWork.Repository<Role>().GetByIdAsync(roleId.Value);
            if (role != null && role.IsActive)
            {
                user.Role = role;
            }
            else
            {
                _logger.LogWarning("Role not found or inactive while assigning to user {UserId}: {RoleId}",
                    user.UserId, roleId);
            }
        }
    }
}
