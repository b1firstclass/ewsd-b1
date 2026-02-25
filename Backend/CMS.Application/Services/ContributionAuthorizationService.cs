using CMS.Application.Common;
using CMS.Application.Interfaces.Repositories;
using CMS.Application.Interfaces.Services;
using CMS.Domain.Entities;

namespace CMS.Application.Services
{

    public class ContributionAuthorizationService : IContributionAuthorizationService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ContributionAuthorizationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public Task ValidateStudentCanCreateContributionAsync(User currentUser)
        {
            if (!IsInRole(currentUser, ContributionConstants.RoleStudent))
            {
                throw new UnauthorizedAccessException("Forbidden");
            }

            return Task.CompletedTask;
        }

        public async Task ValidateStudentCanSubmitContributionAsync(Contribution contribution, User currentUser)
        {
            if (!IsInRole(currentUser, ContributionConstants.RoleStudent))
            {
                throw new UnauthorizedAccessException("Forbidden");
            }

            ValidateUserOwnsContribution(contribution, currentUser.UserId);
            ValidateContributionStatus(contribution.Status, ContributionConstants.StatusDraft, "Only draft contributions can be submitted.");

            await ValidateCoordinatorExistsForUserFacultiesAsync(currentUser);
        }

        public async Task ValidateCoordinatorCanReviewContributionAsync(Contribution contribution, User currentUser, string targetStatus)
        {
            if (!IsInRole(currentUser, ContributionConstants.RoleCoordinator))
            {
                throw new UnauthorizedAccessException("Forbidden");
            }

            ValidateContributionStatus(contribution.Status, ContributionConstants.StatusSubmitted, "Only submitted contributions can be reviewed.");
            ValidateReviewStatus(targetStatus);

            await ValidateCoordinatorSharesFacultyWithOwnerAsync(contribution, currentUser);
        }

        public Task ValidateUserOwnsContributionAsync(Contribution contribution, Guid userId)
        {
            ValidateUserOwnsContribution(contribution, userId);
            return Task.CompletedTask;
        }

        private static void ValidateUserOwnsContribution(Contribution contribution, Guid userId)
        {
            if (contribution.UserId != userId)
            {
                throw new UnauthorizedAccessException("Forbidden");
            }
        }

        private static void ValidateContributionStatus(string currentStatus, string expectedStatus, string errorMessage)
        {
            if (!string.Equals(currentStatus, expectedStatus, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(errorMessage);
            }
        }

        private static void ValidateReviewStatus(string targetStatus)
        {
            if (!string.Equals(targetStatus, ContributionConstants.StatusApproved, StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(targetStatus, ContributionConstants.StatusRejected, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Only Approved or Rejected statuses are allowed for review.");
            }
        }

        private async Task ValidateCoordinatorExistsForUserFacultiesAsync(User currentUser)
        {
            var facultyIds = currentUser.Faculties.Select(faculty => faculty.FacultyId).ToList();
            if (facultyIds.Count == 0)
            {
                throw new InvalidOperationException("User is not assigned to a faculty.");
            }

            var coordinatorExists = await _unitOfWork.UsersRepository.ExistsUserInRoleWithFacultiesAsync(
                ContributionConstants.RoleCoordinator,
                facultyIds,
                currentUser.UserId);

            if (!coordinatorExists)
            {
                throw new InvalidOperationException("No coordinator found for the user's faculty.");
            }
        }

        private async Task ValidateCoordinatorSharesFacultyWithOwnerAsync(Contribution contribution, User currentUser)
        {
            var owner = await _unitOfWork.UsersRepository.GetByUserIdAsync(contribution.UserId);
            if (owner == null)
            {
                throw new InvalidOperationException("Contribution owner not found.");
            }

            var sharesFaculty = currentUser.Faculties.Any(faculty =>
                owner.Faculties.Any(ownerFaculty => ownerFaculty.FacultyId == faculty.FacultyId));

            if (!sharesFaculty)
            {
                throw new UnauthorizedAccessException("Forbidden");
            }
        }

        private static bool IsInRole(User user, string roleName)
        {
            return user.Roles.Any(role => string.Equals(role.Name, roleName, StringComparison.OrdinalIgnoreCase));
        }
    }
}
