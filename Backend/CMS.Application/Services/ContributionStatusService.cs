using CMS.Application.Common;
using CMS.Application.Interfaces.Services;
using CMS.Domain.Entities;

namespace CMS.Application.Services
{

    public class ContributionStatusService : IContributionStatusService
    {
        public string NormalizeStatus(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                throw new ArgumentException("Status is required");
            }

            if (!ContributionConstants.StatusMap.TryGetValue(status.Trim(), out var normalized))
            {
                throw new InvalidOperationException($"Status '{status}' is not supported.");
            }

            return normalized;
        }

        public void UpdateContributionStatus(Contribution contribution, string status, Guid? currentUserId)
        {
            if (string.Equals(status, ContributionConstants.StatusDraft, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Status change to Draft is not supported.");
            }

            var now = DateTime.UtcNow;
            contribution.Status = status;
            contribution.ModifiedDate = now;
            contribution.ModifiedBy = currentUserId;

            if (IsStatusSubmitted(status))
            {
                contribution.SubmittedDate = now;
                contribution.SubmittedBy = currentUserId;
            }
            else if (IsStatusUnderReview(status))
            {
                contribution.ReviewedDate = now;
                contribution.ReviewedBy = currentUserId;
            }
        }

        public bool IsStatusDraft(string status)
        {
            return string.Equals(status, ContributionConstants.StatusDraft, StringComparison.OrdinalIgnoreCase);
        }

        public bool IsRevisionRequired(string status)
        {
            return string.Equals(status, ContributionConstants.StatusRevisionRequired, StringComparison.OrdinalIgnoreCase);
        }

        public bool IsStatusSubmitted(string status)
        {
            return string.Equals(status, ContributionConstants.StatusSubmitted, StringComparison.OrdinalIgnoreCase);
        }

        public bool IsStatusUnderReview(string status)
        {
            return string.Equals(status, ContributionConstants.StatusUnderReview, StringComparison.OrdinalIgnoreCase);
        }
    }
}
