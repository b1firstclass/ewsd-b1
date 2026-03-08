using CMS.Domain.Entities;

namespace CMS.Application.Interfaces.Services
{
    public interface IContributionStatusService
    {
        string NormalizeStatus(string status);
        void UpdateContributionStatus(Contribution contribution, string status, Guid? currentUserId);
        bool IsStatusDraft(string status);
        bool IsRevisionRequired(string status);
        bool IsStatusSubmitted(string status);
        bool IsStatusUnderReview(string status);
    }
}
