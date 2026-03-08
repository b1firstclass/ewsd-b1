using CMS.Domain.Entities;

namespace CMS.Application.Interfaces.Services
{
    public interface IContributionAuthorizationService
    {
        Task ValidateStudentCanSubmitContributionAsync(Contribution contribution, User currentUser);
        Task ValidateCoordinatorCanReviewContributionAsync(Contribution contribution, User currentUser, string targetStatus);
        Task ValidateUserOwnsContributionAsync(Contribution contribution, Guid userId);
    }
}
