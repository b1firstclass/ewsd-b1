using System;
using System.Collections.Generic;

namespace CMS.Application.Common
{
    public static class ContributionConstants
    {
        public const long MaxDocumentFileSizeBytes = 10 * 1024 * 1024;
        public const long MaxImageFileSizeBytes = 5 * 1024 * 1024;
        public const string StatusDraft = "Draft";
        public const string StatusSubmitted = "Submitted";
        public const string StatusApproved = "Approved";
        public const string StatusRejected = "Rejected";
        public const string RoleStudent = "Student";
        public const string RoleCoordinator = "Coordinator";

        public static readonly Dictionary<string, string> StatusMap = new(StringComparer.OrdinalIgnoreCase)
        {
            [StatusDraft] = StatusDraft,
            [StatusSubmitted] = StatusSubmitted,
            [StatusApproved] = StatusApproved,
            [StatusRejected] = StatusRejected
        };

        public static readonly HashSet<string> AllowedDocumentExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".doc",
            ".docx"
        };

        public static readonly HashSet<string> AllowedImageExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".webp"
        };
    }
}
