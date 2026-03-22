using CMS.Domain.Attributes;
using System.ComponentModel.DataAnnotations;

namespace CMS.Domain.Entities;

[MetadataType(typeof(vw_ContributionsWithoutCommentAfter14DayMetadata))]
public partial class vw_ContributionsWithoutCommentAfter14Day
{
    private sealed class vw_ContributionsWithoutCommentAfter14DayMetadata
    {
        [Searchable]
        public string? FacultyName { get; set; }

        [Searchable]
        public string? FullName { get; set; }

        [Searchable]
        public string? Subject { get; set; }
    }
}
