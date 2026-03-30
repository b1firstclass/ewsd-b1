using CMS.Domain.Attributes;
using System.ComponentModel.DataAnnotations;

namespace CMS.Domain.Entities;

[MetadataType(typeof(vw_ContributionsWithoutCommentMetadata))]
public partial class vw_ContributionsWithoutComment
{
    private sealed class vw_ContributionsWithoutCommentMetadata
    {
        [Searchable]
        public string? FacultyName { get; set; }

        [Searchable]
        public string? FullName { get; set; }

        [Searchable]
        public string? Subject { get; set; }
    }
}
